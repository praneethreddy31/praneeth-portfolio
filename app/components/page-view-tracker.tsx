import { useLocation } from "@remix-run/react";
import { useEffect } from "react";
import { normalizePageViewSource } from "../utils/page-view-source";

let lastTrackedRouteKey: string | null = null;

export default function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    const routeKey = `${location.pathname}?${location.search}`;

    if (lastTrackedRouteKey === routeKey) {
      return;
    }

    lastTrackedRouteKey = routeKey;

    const searchParams = new URLSearchParams(location.search);
    const source = normalizePageViewSource(searchParams.get("source"));

    void fetch(`/api/page-view?source=${encodeURIComponent(source)}`, {
      credentials: "same-origin",
      keepalive: true,
      method: "POST",
    }).catch(() => undefined);
  }, [location.pathname, location.search]);

  return null;
}
