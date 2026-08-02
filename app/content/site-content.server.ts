import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ZodType } from "zod";
import {
  filterPublishedProjects,
  filterPublishedWorkExperiences,
  filterVisibleNavItems,
  ensureUniqueBy,
  sortProjects,
  sortWorkExperiences,
} from "./mappers";
import {
  HomeContentSchema,
  NavigationItemSchema,
  ProjectsSectionSchema,
  ReachOutSectionSchema,
  SocialLinkSchema,
  TechStackSectionSchema,
  WorkExperienceSectionSchema,
} from "./schemas";
import type {
  SiteReachOutSection,
  SiteHomeContent,
  SiteNavigationItem,
  SiteProjectsSection,
  SiteSocialLink,
  SiteTechStackSection,
  SiteWorkExperienceSection,
} from "../types";

const SITE_CONTENT_ROOT = path.join(process.cwd(), "content", "site");

async function loadJsonFile<T>(
  fileName: string,
  schema: ZodType<T>,
): Promise<T> {
  const filePath = path.join(SITE_CONTENT_ROOT, fileName);
  const raw = await readFile(filePath, "utf8");
  const json = JSON.parse(raw) as unknown;

  return schema.parse(json);
}

export async function getHomeContent(): Promise<SiteHomeContent> {
  return loadJsonFile("home.json", HomeContentSchema);
}

export async function getProjectsSection(): Promise<SiteProjectsSection> {
  const content = await loadJsonFile("projects.json", ProjectsSectionSchema);
  const items = ensureUniqueBy(content.items, (item) => item.id, "project id");
  ensureUniqueBy(items, (item) => item.slug, "project slug");

  return {
    ...content,
    items: sortProjects(filterPublishedProjects(items)),
  };
}

export async function getReachOutSection(): Promise<SiteReachOutSection> {
  return loadJsonFile("reach-out.json", ReachOutSectionSchema);
}

export async function getTechStackSection(): Promise<SiteTechStackSection> {
  const content = await loadJsonFile("tech-stack.json", TechStackSectionSchema);
  const items = ensureUniqueBy(content.items, (item) => item.id, "tech stack id");

  return {
    ...content,
    items: [...items].sort((left, right) => left.sortOrder - right.sortOrder),
  };
}

export async function getWorkExperienceSection(): Promise<SiteWorkExperienceSection> {
  const content = await loadJsonFile(
    "work-experience.json",
    WorkExperienceSectionSchema,
  );
  const items = ensureUniqueBy(
    content.items,
    (item) => item.id,
    "work experience id",
  );

  return {
    ...content,
    items: sortWorkExperiences(filterPublishedWorkExperiences(items)),
  };
}

export async function getNavigationItems(): Promise<SiteNavigationItem[]> {
  const items = await loadJsonFile(
    "navigation.json",
    NavigationItemSchema.array(),
  );

  return filterVisibleNavItems(items);
}

export async function getSocialLinks(): Promise<SiteSocialLink[]> {
  return loadJsonFile("social-links.json", SocialLinkSchema.array());
}
