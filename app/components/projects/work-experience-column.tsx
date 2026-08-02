import { staggerDelay, surfaces, textStyles } from "../../config/ui";
import type { SiteWorkExperience } from "../../types";
import { cn } from "../../utils/cn";
import GlassSheen from "../ui/glass-sheen";
import SectionHeadingRow from "../ui/section-heading-row";

interface WorkExperienceColumnProps {
  title: string;
  items: SiteWorkExperience[];
}

export default function WorkExperienceColumn({
  title,
  items,
}: WorkExperienceColumnProps) {
  return (
    <section
      className={cn(surfaces.workPanel, "motion-safe:[animation-delay:-3.7s] motion-safe:[animation-duration:12.9s]")}
    >
      <GlassSheen className="left-[-45%] bg-white/[0.035] motion-safe:[animation-delay:-7.1s] motion-safe:[animation-duration:12.4s]" />
      <SectionHeadingRow
        label="timeline"
        labelClassName={textStyles.accentLabel}
        title={title}
        titleClassName={textStyles.panelTitle}
      />

      <div className="mt-6 grid gap-3">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="grid gap-3 rounded-[1.35rem] bg-theme-black/32 px-4 py-4 font-mono text-[0.82rem] leading-5 text-white/62 shadow-[0_12px_38px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/8 motion-safe:animate-work-reveal sm:grid-cols-[7.25rem_minmax(0,1fr)] sm:text-[0.88rem]"
            style={{ animationDelay: staggerDelay(index, 120, 70) }}
          >
            <div>
              <p className="text-[0.64rem] uppercase tracking-[0.14em] text-white/46">
                {item.periodLabel}
              </p>
              {item.location ? (
                <p className="mt-2 text-[0.64rem] uppercase tracking-[0.14em] text-white/46">
                  {item.location}
                </p>
              ) : null}
            </div>

            <div>
              <h3 className="font-mono text-[0.96rem] font-semibold text-white sm:text-[1.02rem]">
                {item.role}
              </h3>
              <p className="mt-1 text-white/86">{item.company}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
