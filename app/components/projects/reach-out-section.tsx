import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { staggerDelay, surfaces, textStyles } from "../../config/ui";
import type { SiteReachOutSection } from "../../types";
import { externalLinkProps } from "../../utils/link";
import GlassSheen from "../ui/glass-sheen";

interface ReachOutSectionProps {
  content: SiteReachOutSection;
}

export default function ReachOutSection({ content }: ReachOutSectionProps) {
  return (
    <section className={surfaces.reachOutPanel}>
      <GlassSheen className="left-[-40%] bg-white/[0.035] motion-safe:[animation-delay:-6.4s] motion-safe:[animation-duration:12.7s]" />
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-accent/24 blur-3xl motion-safe:animate-reach-pulse motion-safe:[animation-delay:-3.1s]"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <p className={textStyles.accentLabel}>
            {content.eyebrow}
          </p>
          <h2 className="mt-4 font-doto text-[clamp(2.75rem,14vw,8rem)] font-black uppercase leading-[0.82] tracking-section text-white">
            {content.title}
          </h2>
        </div>
        <p className="max-w-[58ch] font-mono text-[0.82rem] leading-7 text-white/68 sm:text-[0.9rem] lg:justify-self-end">
          {content.description}
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3">
        {content.lanes.map((lane, index) => {
          const segments = lane.segments ?? [
            {
              actions: lane.actions,
              description: lane.description,
              title: lane.title,
            },
          ];

          return (
            <article
              key={lane.id}
              className="relative min-w-0 overflow-hidden rounded-[1.5rem] bg-theme-black/40 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.10)] ring-1 ring-white/10 motion-safe:animate-work-reveal sm:rounded-[1.75rem] sm:p-6"
              style={{ animationDelay: staggerDelay(index, 240, 90) }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-white/48"
              />
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-accent">
                {lane.label}
              </p>

              <div className="mt-5 grid gap-7">
                {segments.map((segment) => (
                  <div key={segment.title}>
                    <h3 className="font-doto text-[2.25rem] font-black uppercase leading-[0.9] tracking-section text-white sm:text-[2.7rem]">
                      {segment.title}
                    </h3>
                    <p className="mt-5 font-mono text-[0.76rem] leading-6 text-white/62">
                      {segment.description}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-2">
                      {segment.actions.map((action) => (
                        <a
                          key={action.label}
                          href={action.href}
                          {...externalLinkProps(action.href)}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-theme-black shadow-[0_12px_32px_rgba(255,255,255,0.12)]"
                        >
                          <span>{action.label}</span>
                          <FaArrowUpRightFromSquare className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
