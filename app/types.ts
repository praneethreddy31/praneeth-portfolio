export type HomeSectionId = "about";
export type NavigationKey = HomeSectionId | "projects";

export interface SiteHeroContent {
  title: string;
  subtitle: string;
}

export interface SpotifyPlaylist {
  title: string;
  embedUrl: string;
}

export interface SiteHomeContent {
  hero: SiteHeroContent;
  about: {
    paragraphs: string[];
  };
  spotifyPlaylists: SpotifyPlaylist[];
  books: BookInfo[];
}

export interface WorkExperienceLink {
  label: string;
  url: string;
}

export interface SiteWorkExperience {
  id: string;
  role: string;
  company: string;
  periodLabel: string;
  startDate: string;
  endDate?: string | null;
  summary: string;
  highlights: string[];
  location?: string;
  links: WorkExperienceLink[];
  published: boolean;
  sortOrder: number;
}

export interface SiteWorkExperienceSection {
  sectionTitle: string;
  items: SiteWorkExperience[];
}

export interface SiteProject {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  tech: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  image?: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  year: number;
  role: string;
  status: string;
}

export interface SiteProjectsSection {
  sectionTitle: string;
  items: SiteProject[];
}

export interface SiteTechStackItem {
  id: string;
  label: string;
  group: string;
  accent?: boolean;
  sortOrder: number;
}

export interface SiteTechStackSection {
  eyebrow: string;
  title: string;
  description: string;
  items: SiteTechStackItem[];
}

export interface ReachOutAction {
  label: string;
  href: string;
}

export interface ReachOutSegment {
  title: string;
  description: string;
  actions: ReachOutAction[];
}

export interface ReachOutLane {
  id: string;
  label: string;
  title: string;
  description: string;
  actions: ReachOutAction[];
  segments?: ReachOutSegment[];
  options?: ReachOutAction[];
}

export interface SiteReachOutSection {
  eyebrow: string;
  title: string;
  description: string;
  lanes: ReachOutLane[];
}

export interface SiteNavigationItem {
  key: NavigationKey;
  label: string;
  href: string;
  visible: boolean;
}

export interface SiteSocialLink {
  label: string;
  url: string;
}

export type ReachStatId = "instagram" | "x" | "visits";

export interface ReachStat {
  id: ReachStatId;
  label: string;
  metricLabel: string;
  tooltip?: string;
  numericValue: number;
  value: string;
  href?: string;
  live: boolean;
}

export interface BookInfo {
  id: string;
  title: string;
  authors: string[];
  publishedDate?: string;
  thumbnail?: string;
}
