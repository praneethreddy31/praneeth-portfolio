import type {
  SiteNavigationItem,
  SiteProject,
  SiteWorkExperience,
} from "../types";

export function ensureUniqueBy<T>(
  items: T[],
  selector: (item: T) => string,
  label: string,
): T[] {
  const seen = new Set<string>();

  for (const item of items) {
    const value = selector(item);

    if (seen.has(value)) {
      throw new Error(`Duplicate ${label}: ${value}`);
    }

    seen.add(value);
  }

  return items;
}

export function sortProjects(projects: SiteProject[]): SiteProject[] {
  return [...projects].sort((left, right) => {
    if (left.featured !== right.featured) {
      return Number(right.featured) - Number(left.featured);
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return right.year - left.year;
  });
}

export function sortWorkExperiences(
  items: SiteWorkExperience[],
): SiteWorkExperience[] {
  return [...items].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return right.startDate.localeCompare(left.startDate);
  });
}

export function filterPublishedProjects(projects: SiteProject[]): SiteProject[] {
  return projects.filter((project) => project.published);
}

export function filterPublishedWorkExperiences(
  items: SiteWorkExperience[],
): SiteWorkExperience[] {
  return items.filter((item) => item.published);
}

export function filterVisibleNavItems(
  items: SiteNavigationItem[],
): SiteNavigationItem[] {
  return items.filter((item) => item.visible);
}
