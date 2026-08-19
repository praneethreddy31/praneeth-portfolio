import * as React from "react";

export interface LogosCarouselProps {
  ariaLabel?: string;
  children: React.ReactNode;
  stagger?: number;
  count?: number;
  className?: string;
  duration?: number;
  interval?: number;
  initialDelay?: number;
}

export function LogosCarousel({
  ariaLabel,
  children,
  stagger = 0.14,
  count,
  className,
  duration = 600,
  interval = 2500,
  initialDelay = 500,
}: LogosCarouselProps) {
  const [index, setIndex] = React.useState(0);
  const [animate, setAnimate] = React.useState(false);
  const [nextIndex, setNextIndex] = React.useState(1);
  const childrenArray = React.Children.toArray(children);
  const logosPerGroup = count || childrenArray.length;
  const groups: React.ReactNode[][] = [];

  for (let i = 0; i < childrenArray.length; i += logosPerGroup) {
    groups.push(childrenArray.slice(i, i + logosPerGroup));
  }

  const groupsLength = groups.length;

  React.useEffect(() => {
    const id = window.setTimeout(() => setAnimate(true), initialDelay);
    return () => window.clearTimeout(id);
  }, [initialDelay]);

  React.useEffect(() => {
    if (!animate || groupsLength === 0) return;

    const intervalId = window.setInterval(() => {
      setIndex((previousIndex) => {
        const newIndex = (previousIndex + 1) % groupsLength;
        setNextIndex((newIndex + 1) % groupsLength);
        return newIndex;
      });
    }, interval);

    return () => window.clearInterval(intervalId);
  }, [animate, interval, groupsLength]);

  if (groupsLength === 0) return null;

  return (
    <div className={`logos-carousel ${className ?? ""}`} aria-label={ariaLabel}>
      {groups.map((group, groupIndex) => {
        const isCurrent = groupIndex === index;
        const isNext = groupIndex === nextIndex && animate;
        const isVisible = isCurrent || isNext;

        return (
          <div
            className="logos-carousel-group"
            key={groupIndex}
            style={{ pointerEvents: isVisible ? "auto" : "none" }}
            aria-hidden={!isVisible}
          >
            {group.map((logo, logoIndex) => (
              <Logo
                key={logoIndex}
                state={isCurrent ? "exit" : "enter"}
                animate={animate && isVisible}
                index={logoIndex}
                stagger={stagger}
                duration={duration}
              >
                {logo}
              </Logo>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Logo({
  children,
  animate,
  index,
  state = "enter",
  stagger = 0.14,
  duration = 500,
}: {
  children: React.ReactNode;
  animate?: boolean;
  index: number;
  state?: "enter" | "exit";
  stagger?: number;
  duration?: number;
}) {
  const animationStyles: React.CSSProperties = {
    animationDelay: `${index * stagger}s`,
    animationDuration: `${duration}ms`,
    animationFillMode: "both",
  };

  if (!animate) {
    return <div style={{ ...animationStyles, opacity: state === "enter" ? 0 : 1 }}>{children}</div>;
  }

  return (
    <div
      style={{
        ...animationStyles,
        animationName: state === "enter" ? "logos-enter" : "logos-exit",
        animationTimingFunction: "ease",
      }}
    >
      {children}
    </div>
  );
}
