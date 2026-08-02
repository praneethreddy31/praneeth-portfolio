import { Redis } from "@upstash/redis";
import {
  normalizePageViewSource,
  type PageViewSource,
} from "../utils/page-view-source";

const PAGE_VIEW_TOTAL_KEY = "portfolio:page_views:total";
const PAGE_VIEW_SOURCE_KEY_PREFIX = "portfolio:page_views:source:";
export const PAGE_VIEW_BASELINE = 150_000;

interface PageViewTotalResult {
  live: boolean;
  total: number;
}

interface PageViewIncrementResult extends PageViewTotalResult {
  source: PageViewSource;
}

let redisClient: Redis | null | undefined;

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

export async function getPageViewTotal(): Promise<PageViewTotalResult> {
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
