import type { ReachStat } from "../types";
import { PAGE_VIEW_BASELINE, getPageViewTotal } from "./page-views.server";

const STATIC_REACH_STATS: ReachStat[] = [
  {
    href: "https://x.com/ohshinbhat",
    id: "x",
    label: "twitter",
    metricLabel: "Impressions",
    numericValue: 2_000_000,
    value: "2M+",
    live: false,
  },
  {
    href: "https://www.instagram.com/ohshiin/",
    id: "instagram",
    label: "instagram",
    metricLabel: "Views",
    numericValue: 250_000,
    value: "250K+",
    live: false,
  },
  {
    id: "visits",
    label: "page visits",
    metricLabel: "Page visits",
    tooltip: "My previous portfolio already had 150,000 visits, so I carried that history over here.",
    numericValue: PAGE_VIEW_BASELINE,
    value: "150K+",
    live: false,
  },
];

function formatCompactCount(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value)}+`;
}

export async function getReachStats() {
  const pageViews = await getPageViewTotal();

  return STATIC_REACH_STATS.map((stat) => {
    if (stat.id !== "visits") {
      return stat;
    }

    return {
      ...stat,
      live: pageViews.live,
      tooltip: "My previous portfolio already had 150,000 visits, so I carried that history over here.",
      numericValue: pageViews.total,
      value: formatCompactCount(pageViews.total),
    };
  });
}
