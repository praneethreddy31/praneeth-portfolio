import { Redis } from "@upstash/redis";
import {
  normalizePageViewSource,
  type PageViewSource,
} from "../utils/page-view-source";

const PAGE_VIEW_TOTAL_KEY = "portfolio:visitors:total:v1";
const PAGE_VIEW_SOURCE_KEY_PREFIX = "portfolio:visitors:source:v1:";
export const PAGE_VIEW_BASELINE = 0;

interface PageViewTotalResult {
  live: boolean;
  total: number;
}

interface PageViewIncrementResult extends PageViewTotalResult {
  source: PageViewSource;
}

interface VercelAnalyticsResponse {
  data?: {
    pageviews?: unknown;
    visitors?: unknown;
  };
}

const VERCEL_CACHE_TTL_MS = 30_000;

let redisClient: Redis | null | undefined;
let vercelTotalCache: { expiresAt: number; total: number } | null = null;

function getRedisClient() {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({ token, url });
  return redisClient;
}

function readCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : null;
}

async function getVercelVisitorTotal(): Promise<number | null> {
  const token = process.env.VERCEL_ANALYTICS_TOKEN ?? process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) return null;

  const now = Date.now();
  if (vercelTotalCache && vercelTotalCache.expiresAt > now) {
    return vercelTotalCache.total;
  }

  const endpoint = new URL(
    "https://api.vercel.com/v1/query/web-analytics/visits/count",
  );
  endpoint.searchParams.set("projectId", projectId);

  const teamId = process.env.VERCEL_TEAM_ID;
  if (teamId) endpoint.searchParams.set("teamId", teamId);

  try {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;

    const result = (await response.json()) as VercelAnalyticsResponse;
    const total = readCount(result.data?.visitors);
    if (total === null) return null;

    vercelTotalCache = {
      expiresAt: now + VERCEL_CACHE_TTL_MS,
      total,
    };
    return total;
  } catch {
    return null;
  }
}

export async function getPageViewTotal(): Promise<PageViewTotalResult> {
  const vercelTotal = await getVercelVisitorTotal();
  if (vercelTotal !== null) {
    return { live: true, total: vercelTotal };
  }

  const redis = getRedisClient();

  if (!redis) {
    return {
      live: false,
      total: PAGE_VIEW_BASELINE,
    };
  }

  try {
    const total = await redis.get<number>(PAGE_VIEW_TOTAL_KEY);

    return {
      live: true,
      total: PAGE_VIEW_BASELINE + (total ?? 0),
    };
  } catch {
    return {
      live: false,
      total: PAGE_VIEW_BASELINE,
    };
  }
}

export async function incrementPageView(
  sourceInput: string | null | undefined,
): Promise<PageViewIncrementResult> {
  const source = normalizePageViewSource(sourceInput);
  const redis = getRedisClient();

  if (!redis) {
    return {
      live: false,
      source,
      total: PAGE_VIEW_BASELINE,
    };
  }

  try {
    const total = await redis.incr(PAGE_VIEW_TOTAL_KEY);
    await redis.incr(`${PAGE_VIEW_SOURCE_KEY_PREFIX}${source}`);

    return {
      live: true,
      source,
      total: PAGE_VIEW_BASELINE + total,
    };
  } catch {
    return {
      live: false,
      source,
      total: PAGE_VIEW_BASELINE,
    };
  }
}
