import { useLocation } from "@remix-run/react";
import { useEffect } from "react";
import { normalizePageViewSource } from "../utils/page-view-source";

const VISITOR_STORAGE_KEY = "praneeth-portfolio-visitor-v1";
let visitorTrackedInSession = false;

export default function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    if (visitorTrackedInSession) return;
    visitorTrackedInSession = true;

    try {
      if (localStorage.getItem(VISITOR_STORAGE_KEY)) return;
    } catch {
      // The in-memory guard still prevents duplicate SPA counts.
    }

    const searchParams = new URLSearchParams(location.search);
    const source = normalizePageViewSource(searchParams.get("source"));

    void fetch(`/api/page-view?source=${encodeURIComponent(source)}`, {
      credentials: "same-origin",
      keepalive: true,
      method: "POST",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to count visitor");
        const result = (await response.json()) as { live?: unknown };
        if (result.live !== true) {
          visitorTrackedInSession = false;
          return;
        }
        try {
          localStorage.setItem(VISITOR_STORAGE_KEY, "1");
        } catch {
          // Storage can be unavailable in privacy-focused browsers.
        }
      })
      .catch(() => {
        visitorTrackedInSession = false;
      });
  }, [location.search]);

  return null;
}
