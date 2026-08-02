import { useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { ComponentType } from "react";
import type { HomeSectionId, SiteNavigationItem, SiteSocialLink } from "../types";
import DockNav from "./react-bits/dock-nav";
import { useActiveHomeSection } from "../hooks/use-active-home-section";
import { externalLinkProps } from "../utils/link";
import { isHomeSectionId, scrollWindowToSection } from "../utils/nav";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaRegEnvelope,
  FaXTwitter,
} from "react-icons/fa6";

interface SiteNavProps {
  currentPage?: "home" | "work";
  items: SiteNavigationItem[];
  socialLinks: SiteSocialLink[];
}

const SOCIAL_ICON_MAP: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  github: FaGithub,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  mail: FaRegEnvelope,
  x: FaXTwitter,
};

const SOCIAL_ICON_CLASS_MAP: Record<string, string> = {
  github: "h-5 w-5 sm:h-6 sm:w-6",
  instagram: "h-6 w-6 sm:h-7 sm:w-7",
  linkedin: "h-5 w-5 sm:h-6 sm:w-6",
  mail: "h-5 w-5 sm:h-6 sm:w-6",
  x: "h-5 w-5 sm:h-5.5 sm:w-5.5",
};

function getTargetSectionFromState(state: unknown): HomeSectionId | null {
  if (typeof state !== "object" || state === null || !("targetSection" in state)) {
    return null;
  }

  const targetSection = (state as { targetSection?: unknown }).targetSection;

  if (typeof targetSection !== "string" || !isHomeSectionId(targetSection)) {
    return null;
  }

  return targetSection;
}

export default function SiteNav({
  currentPage = "home",
  items,
  socialLinks,
}: SiteNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const hideTimeoutRef = useRef<number | null>(null);
  const tickingRef = useRef(false);
  const [isDockHidden, setIsDockHidden] = useState(false);
  const activeHomeSection = useActiveHomeSection(currentPage === "home");
  const isHomePage = location.pathname === "/";
  const visibleItems = items.filter(
    (item): item is SiteNavigationItem =>
      item.key === "about" || item.key === "projects",
  );
  const visibleSocialLinks = socialLinks.filter((link) =>
    Object.hasOwn(SOCIAL_ICON_MAP, link.label.toLowerCase()),
  );

  const activeKey = location.pathname.startsWith("/work")
    ? "projects"
    : activeHomeSection;

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsDockHidden(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.pathname]);

  useEffect(() => {
    const nav = document.querySelector("header[data-site-nav]");

    if (!nav) {
      return;
    }

    const updateNavHeight = () => {
      const height = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--site-nav-height", `${height}px`);
    };

    updateNavHeight();
    window.addEventListener("resize", updateNavHeight);

    return () => {
      window.removeEventListener("resize", updateNavHeight);
    };
  }, []);

  const handleClick = (
    event: MouseEvent<HTMLAnchorElement>,
    item: SiteNavigationItem,
  ) => {
    if (item.key === "projects") {
      return;
    }

    if (!isHomePage) {
      event.preventDefault();
      navigate(`/#${item.key}`);
      return;
    }

    event.preventDefault();
    window.history.replaceState(null, "", `/#${item.key}`);
    scrollWindowToSection(item.key);
  };

  useEffect(() => {
    if (location.pathname === "/work" || location.pathname.startsWith("/work/")) {
      const sectionId = location.hash.slice(1);

      if (isHomeSectionId(sectionId)) {
        navigate(`/#${sectionId}`, { replace: true });
      }
    }
  }, [location.hash, location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname !== "/") return;
    const stateSection = getTargetSectionFromState(location.state);
    const sectionId = stateSection ?? location.hash.slice(1);
    if (!isHomeSectionId(sectionId)) return;

    // Delay to ensure layout is ready before measuring positions
    window.requestAnimationFrame(() => {
      window.history.replaceState(null, "", `/#${sectionId}`);
      scrollWindowToSection(sectionId);
    });
  }, [location.pathname, location.hash, location.state]);

  useEffect(() => {
    const updateDockVisibility = () => {
      const currentScrollY = window.scrollY;

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }

      if (currentScrollY < 24) {
        setIsDockHidden(false);
      } else {
        setIsDockHidden(true);
        hideTimeoutRef.current = window.setTimeout(() => {
          setIsDockHidden(false);
        }, 560);
      }

      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (tickingRef.current) {
        return;
      }

      tickingRef.current = true;
      window.requestAnimationFrame(updateDockVisibility);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 flex w-full justify-center px-2 transition-transform duration-300 ease-out sm:bottom-6 sm:px-3 ${
        isDockHidden ? "translate-y-[calc(100%+2rem)]" : "translate-y-0"
      }`}
      data-site-nav
    >
      <div className="pointer-events-auto relative max-w-[calc(100vw-1rem)] overflow-hidden rounded-full border border-white/14 bg-[rgba(10,12,17,0.42)] p-1 shadow-nav-glass backdrop-blur-2xl sm:max-w-full sm:p-1.5">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.045)_42%,rgba(0,0,0,0.12))]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-px rounded-full border border-black/18"
        />

        <nav
          aria-label="Primary"
          className="relative flex max-w-full items-center justify-start gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center sm:gap-1.5 sm:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          <DockNav
            items={visibleItems}
            activeKey={activeKey}
            onItemClick={handleClick}
          />
          {visibleSocialLinks.length > 0 ? (
            <>
              <span
                aria-hidden="true"
                className="h-7 w-px shrink-0 bg-white/10"
              />
              <div className="flex shrink-0 items-center gap-0.5 pr-0.5 sm:gap-1 sm:pr-1">
                {visibleSocialLinks.map((link) => {
                  const iconKey = link.label.toLowerCase();
                  const Icon = SOCIAL_ICON_MAP[iconKey];
                  const iconClassName =
                    SOCIAL_ICON_CLASS_MAP[iconKey] ?? "h-6 w-6";

                  return (
                    <a
                      key={link.label}
                      aria-label={link.label}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/68 transition-colors duration-150 hover:text-white sm:h-11 sm:w-11"
                      href={link.url}
                      {...externalLinkProps(link.url)}
                    >
                      <Icon className={iconClassName} />
                    </a>
                  );
                })}
              </div>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
