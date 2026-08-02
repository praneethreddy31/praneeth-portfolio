import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FaCircleInfo, FaEye, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { staggerDelay, surfaces, textStyles } from "../../config/ui";
import type { ReachStat } from "../../types";
import GlassSheen from "../ui/glass-sheen";
import SectionHeadingRow from "../ui/section-heading-row";

interface ReachStripProps {
  stats: ReachStat[];
}

const STAT_ICON_MAP: Partial<
  Record<ReachStat["id"], IconType>
> = {
  instagram: FaInstagram,
  visits: FaEye,
  x: FaXTwitter,
};

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function getCountStorageKey(value: number) {
  return `portfolio-reach-count-started:${value}`;
}

function hasStartedCount(storageKey: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(storageKey) === "1";
}

function persistStartedCount(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(storageKey, "1");
}

function CountUpNumber({
  storageKey,
  value,
}: {
  storageKey: string;
  value: number;
}) {
  const frameRef = useRef<number | null>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 5_800;
    const startedAt = window.performance.now();

    persistStartedCount(storageKey);

    const tick = (time: number) => {
      const progress = Math.min((time - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(value * easedProgress);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [storageKey, value]);

  return <span>{formatCount(displayValue)}+</span>;
}

function AnimatedCount({ value }: { value: number }) {
  const storageKey = getCountStorageKey(value);
  const [hasStarted] = useState(() => hasStartedCount(storageKey));

  if (hasStarted) {
    return <span>{formatCount(value)}+</span>;
  }

  return <CountUpNumber storageKey={storageKey} value={value} />;
}

function StatTooltip({ text }: { text: string }) {
  return (
    <span className="group/tooltip relative inline-flex">
      <button
        type="button"
        aria-label={text}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white/45 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
      >
        <FaCircleInfo className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 z-20 w-52 -translate-x-1/2 rounded-xl border border-white/12 bg-theme-black/90 px-3 py-2 font-mono text-[0.58rem] normal-case leading-4 tracking-normal text-white/72 opacity-0 shadow-[0_18px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl transition duration-200 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

function ReachStatItem({ index, stat }: { index: number; stat: ReachStat }) {
  const Icon = STAT_ICON_MAP[stat.id] ?? FaEye;
  const content = (
    <div
      className="relative isolate grid min-h-[11rem] min-w-0 overflow-hidden rounded-[1.5rem] bg-theme-black/38 px-4 py-4 shadow-[0_22px_80px_rgba(0,0,0,0.28),0_0_44px_rgba(211,23,10,0.12),inset_0_1px_0_rgba(255,255,255,0.11)] ring-1 ring-white/10 motion-safe:animate-work-reveal sm:min-h-[13rem] sm:rounded-[1.75rem] sm:px-6 sm:py-5"
      style={{ animationDelay: staggerDelay(index, 220, 80) }}
    >
      <div
        aria-hidden="true"
        className="absolute -right-14 -top-16 -z-10 h-40 w-40 rounded-full bg-accent/28 blur-2xl motion-safe:animate-reach-pulse"
        style={{ animationDelay: staggerDelay(index, 0, 640) }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 left-1/2 -z-10 h-48 w-48 -translate-x-1/2 rounded-full bg-white/10 blur-3xl motion-safe:animate-reach-pulse"
        style={{ animationDelay: staggerDelay(index, 900, 520) }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_18%_18%,rgba(255,255,255,.10),transparent_34%),radial-gradient(circle_at_80%_90%,rgba(211,23,10,.24),transparent_42%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-white/60 motion-safe:animate-reach-sweep"
      />

      <div className="relative flex items-center justify-between gap-4 font-mono text-[0.74rem] uppercase tracking-[0.18em] text-white/56 sm:text-[0.82rem]">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-white/78" />
          <span>{stat.label}</span>
        </div>
        <span className="font-mono text-[0.58rem] text-accent">
          0{index + 1}
        </span>
      </div>

      <div className="relative mt-10 min-w-0 overflow-hidden">
        <p
          className="truncate font-metric text-[clamp(1.8rem,4.8vw,4.1rem)] font-semibold uppercase leading-none tracking-[-0.08em] text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.26)]"
        >
          <AnimatedCount value={stat.numericValue} />
        </p>
        <div className="mt-3 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/70">
          <span>{stat.metricLabel}</span>
          {stat.tooltip ? <StatTooltip text={stat.tooltip} /> : null}
        </div>
      </div>
    </div>
  );

  if (!stat.href) {
    return content;
  }

  return (
    <a href={stat.href} rel="noreferrer" target="_blank">
      {content}
    </a>
  );
}

export default function ReachStrip({ stats }: ReachStripProps) {
  return (
    <section
      className={`${surfaces.reachPanel} motion-safe:[animation-delay:-8.4s] motion-safe:[animation-duration:14.2s]`}
    >
      <GlassSheen className="left-[-42%] bg-white/[0.04] motion-safe:[animation-delay:-1.8s] motion-safe:[animation-duration:13.1s]" />
      <div
        aria-hidden="true"
        className="absolute -left-24 -top-28 -z-10 h-72 w-72 rounded-full bg-accent/28 blur-3xl motion-safe:animate-reach-pulse motion-safe:[animation-delay:-2.2s]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 top-10 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl motion-safe:animate-reach-pulse motion-safe:[animation-delay:-5.6s]"
      />
      <SectionHeadingRow
        label="live-ish"
        labelClassName={textStyles.accentLabel}
        title="reach"
        titleClassName="font-doto text-[2.25rem] font-black uppercase leading-none tracking-section text-white sm:text-[4.5rem]"
      />

      <div className="mt-6 grid min-w-0 gap-3 sm:mt-7 sm:gap-4 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <ReachStatItem key={stat.id} index={index} stat={stat} />
        ))}
      </div>
    </section>
  );
}
