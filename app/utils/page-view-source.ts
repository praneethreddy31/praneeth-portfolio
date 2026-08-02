const EXPLICIT_PAGE_VIEW_SOURCES = ["twitter", "linkedin", "instagram"] as const;

export type ExplicitPageViewSource = (typeof EXPLICIT_PAGE_VIEW_SOURCES)[number];
export type PageViewSource = ExplicitPageViewSource | "organic";

export function normalizePageViewSource(
  source: string | null | undefined,
): PageViewSource {
  const normalizedSource = source?.trim().toLowerCase();

  if (
    normalizedSource &&
    (EXPLICIT_PAGE_VIEW_SOURCES as readonly string[]).includes(normalizedSource)
  ) {
    return normalizedSource as ExplicitPageViewSource;
  }

  return "organic";
}
