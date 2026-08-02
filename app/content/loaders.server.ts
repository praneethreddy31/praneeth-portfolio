import {
  getHomeContent,
  getNavigationItems,
  getProjectsSection,
  getReachOutSection,
  getSocialLinks,
  getTechStackSection,
  getWorkExperienceSection,
} from "./site-content.server";

export async function getHomePageContent() {
  const [home, navigationItems, socialLinks] =
    await Promise.all([
      getHomeContent(),
      getNavigationItems(),
      getSocialLinks(),
    ]);

  return {
    home,
    navigationItems,
    socialLinks,
  };
}

export async function getWorkPageContent() {
  const [
    navigationItems,
    projects,
    reachOut,
    socialLinks,
    techStack,
    workExperience,
  ] = await Promise.all([
    getNavigationItems(),
    getProjectsSection(),
    getReachOutSection(),
    getSocialLinks(),
    getTechStackSection(),
    getWorkExperienceSection(),
  ]);

  return {
    navigationItems,
    projects,
    reachOut,
    socialLinks,
    techStack,
    workExperience,
  };
}
