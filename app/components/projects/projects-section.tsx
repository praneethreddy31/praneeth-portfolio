import {
  layout,
  surfaces,
  textStyles,
} from "../../config/ui";
import type {
  SiteReachOutSection,
  ReachStat,
  SiteProjectsSection,
  SiteTechStackSection,
  SiteWorkExperienceSection,
} from "../../types";
import { cn } from "../../utils/cn";
import ProjectCard from "./project-card";
import ReachOutSection from "./reach-out-section";
import ReachStrip from "./reach-strip";
import TechStackSection from "./tech-stack-section";
import WorkExperienceColumn from "./work-experience-column";
import WorkClock from "./work-clock";
import GlassSheen from "../ui/glass-sheen";
import SectionHeadingRow from "../ui/section-heading-row";

interface ProjectsSectionProps {
  projects: SiteProjectsSection;
  reachOut: SiteReachOutSection;
  reachStats: ReachStat[];
  techStack: SiteTechStackSection;
  workExperience: SiteWorkExperienceSection;
}

export default function ProjectsSection({
  projects,
  reachOut,
  reachStats,
  techStack,
  workExperience,
}: ProjectsSectionProps) {
  return (
    <section
      id="projects"
      className="relative isolate min-h-screen overflow-hidden bg-accent text-fog [--ledger-accent:#D3170A]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-24 -z-10 h-[34rem] w-[34rem] rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-[44rem] -z-10 h-[38rem] w-[38rem] rounded-full bg-theme-black/20 blur-3xl"
      />
      <div className={`${layout.pageContainer} relative z-10`}>
        <div className="motion-safe:animate-work-reveal">
          <header className={surfaces.workHeader}>
            <GlassSheen className="left-[-35%] bg-white/[0.045] motion-safe:[animation-delay:-2.4s] motion-safe:[animation-duration:10.2s]" />
            <div className={textStyles.headerMeta}>
              <p className="text-white">
                work / output
              </p>
              <p className="hidden text-center sm:block">scroll / inspect</p>
              <p className="sm:text-right">
                <WorkClock /> IST
              </p>
            </div>

            <div className="pt-12 sm:pt-16 lg:pt-20">
              <p className={textStyles.sectionKicker}>
                teams, roles and projects
              </p>
              <h1 className={textStyles.displayTitle}>
                work
              </h1>
            </div>
          </header>
        </div>

        <div className="motion-safe:animate-work-reveal py-10 [animation-delay:160ms] lg:py-12">
          <ReachStrip stats={reachStats} />
        </div>

        <div className="py-4 lg:py-6">
          <TechStackSection content={techStack} />
        </div>

        <div className="grid gap-8 py-4 lg:grid-cols-[minmax(18rem,0.56fr)_minmax(0,1fr)] lg:gap-8 lg:py-6">
          <aside className="motion-safe:animate-work-reveal min-w-0 [animation-delay:220ms]">
            <WorkExperienceColumn
              title={workExperience.sectionTitle}
              items={workExperience.items}
            />
          </aside>

          <main className="motion-safe:animate-work-reveal min-w-0 [animation-delay:280ms]">
            <div className={cn(surfaces.workPanel, "motion-safe:[animation-delay:-6.2s] motion-safe:[animation-duration:13.4s]")}>
              <GlassSheen className="left-[-45%] bg-white/[0.035] motion-safe:[animation-delay:-4.8s] motion-safe:[animation-duration:11.6s]" />
              <SectionHeadingRow
                label="build log"
                labelClassName={textStyles.accentLabel}
                title={projects.sectionTitle}
                titleClassName={textStyles.panelTitle}
              />

              <div className="mt-6 grid gap-3">
                {projects.items.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    revealIndex={index}
                    serial={String(index + 1).padStart(2, "0")}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>

        <div className="motion-safe:animate-work-reveal py-8 [animation-delay:340ms] lg:py-10">
          <ReachOutSection content={reachOut} />
        </div>
      </div>
    </section>
  );
}
