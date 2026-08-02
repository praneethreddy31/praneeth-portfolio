import { useEffect, useState } from "react";
import type { HomeSectionId } from "../types";
import { getSectionAbsoluteTop, HOME_SECTIONS } from "../utils/nav";

export function useActiveHomeSection(enabled: boolean): HomeSectionId {
  const [activeSection, setActiveSection] = useState<HomeSectionId>("about");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const updateActiveSection = () => {
      const scrollY = window.scrollY;
      const sections = HOME_SECTIONS.map(getSectionAbsoluteTop);
      const current = sections.reduce(
        (winner, section) =>
          scrollY + 120 >= section.absoluteTop ? section : winner,
        sections[0],
      );

      if (current?.id) {
        setActiveSection(current.id);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
    };
  }, [enabled]);

  return activeSection;
}
