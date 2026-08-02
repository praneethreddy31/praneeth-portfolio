import type { IconType } from "react-icons";
import { FaAws } from "react-icons/fa6";
import {
  SiExpo,
  SiFigma,
  SiFramer,
  SiGithub,
  SiGraphql,
  SiJavascript,
  SiNextdotjs,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVite,
} from "react-icons/si";
import { surfaces } from "../../config/ui";
import type { SiteTechStackItem, SiteTechStackSection } from "../../types";
import { cn } from "../../utils/cn";

interface TechStackSectionProps {
  content: SiteTechStackSection;
}

const TECH_ICON_MAP: Record<string, IconType> = {
  aws: FaAws,
  expo: SiExpo,
  figma: SiFigma,
  framer: SiFramer,
  github: SiGithub,
  graphql: SiGraphql,
  javascript: SiJavascript,
  nextjs: SiNextdotjs,
  python: SiPython,
  react: SiReact,
  "react-native": SiReact,
  tailwind: SiTailwindcss,
  typescript: SiTypescript,
  vite: SiVite,
};

function TechMark({ item }: { item: SiteTechStackItem }) {
  const Icon = TECH_ICON_MAP[item.id];

  if (Icon) {
    return <Icon className="h-5 w-5 text-white/86 sm:h-6 sm:w-6" />;
  }

  return (
    <span className="grid h-6 min-w-6 place-items-center rounded-md bg-white/12 px-1.5 font-doto text-[0.68rem] font-black uppercase text-white">
      {item.label.slice(0, 2)}
    </span>
  );
}

function TechPill({ item }: { item: SiteTechStackItem }) {
  return (
    <span
      className={cn(
        "flex h-10 items-center gap-2 rounded-full border px-3 font-mono text-[0.58rem] uppercase tracking-[0.16em] shadow-[0_10px_26px_rgba(0,0,0,0.18)] sm:h-11 sm:px-4 sm:text-[0.62rem]",
        item.accent
          ? "border-accent/26 bg-accent/[0.105] text-white"
          : "border-white/10 bg-white/[0.045] text-white/68",
      )}
    >
      <TechMark item={item} />
      {item.label}
    </span>
  );
}

function TechMarquee({
  items,
}: {
  items: SiteTechStackItem[];
}) {
  return (
    <div className="relative overflow-hidden rounded-full border border-white/10 bg-theme-black/24">
      <div className="flex w-max transform-gpu gap-2 py-2 will-change-transform motion-safe:animate-stack-marquee motion-reduce:animate-none">
        {[...items, ...items].map((item, index) => (
          <TechPill key={`${item.id}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function TechStackSection({ content }: TechStackSectionProps) {
  return (
    <section
      className={cn(
        surfaces.workPanel,
        "group/stack !p-4 sm:!p-5",
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-45 [background:radial-gradient(circle_at_16%_14%,rgba(255,255,255,.08),transparent_28%),radial-gradient(circle_at_86%_60%,rgba(211,23,10,.13),transparent_36%)]"
      />

      <div className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-center">
        <div>
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-accent sm:text-[0.62rem]">
            {content.eyebrow}
          </p>
          <h2 className="mt-2 font-doto text-[2rem] font-black uppercase leading-none tracking-section text-white sm:text-[2.65rem]">
            {content.title}
          </h2>
        </div>

        <div className="min-w-0 space-y-2">
          <TechMarquee items={content.items} />
        </div>
      </div>
    </section>
  );
}
