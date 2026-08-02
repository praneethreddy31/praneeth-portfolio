import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ProjectsSection from "../components/projects/projects-section";
import SiteNav from "../components/site-nav";
import { getWorkPageContent } from "../content/loaders.server";
import { getReachStats } from "../lib/reach.server";

export const meta: MetaFunction = () => [
  { title: "Ohshin Bhat" },
];

export async function loader() {
  const workPageContent = await getWorkPageContent();
  const reachStats = await getReachStats();

  return json(
    {
      ...workPageContent,
      reachStats,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=900",
      },
    },
  );
}

export default function WorkPage() {
  const {
    navigationItems,
    projects,
    reachOut,
    reachStats,
    socialLinks,
    techStack,
    workExperience,
  } = useLoaderData<typeof loader>();

  return (
    <main className="bg-ink text-white">
      <SiteNav currentPage="work" items={navigationItems} socialLinks={socialLinks} />
      <ProjectsSection
        projects={projects}
        reachOut={reachOut}
        reachStats={reachStats}
        techStack={techStack}
        workExperience={workExperience}
      />
    </main>
  );
}
