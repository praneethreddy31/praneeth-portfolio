import type { HomeSectionId } from "../types";

export const HOME_SECTIONS: HomeSectionId[] = ["about"];

export function isHomeSectionId(value: string): value is HomeSectionId {
  return value === "about";
}

export function getSectionAbsoluteTop(sectionId: HomeSectionId) {
  const element = document.getElementById(sectionId);

  return {
    id: sectionId,
    absoluteTop: (element?.getBoundingClientRect().top ?? 0) + window.scrollY,
  };
}

export function getNavHeight(): number {
  return (
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--site-nav-height"),
    ) || 0
  );
}

export function scrollWindowToSection(sectionId: HomeSectionId): void {
  const target = document.getElementById(sectionId);

  if (!target) {
    return;
  }

  const rect = target.getBoundingClientRect();
  const targetY = window.scrollY + rect.top;

  window.scrollTo({
    top: Math.max(targetY, 0),
    behavior: "smooth",
  });
}
