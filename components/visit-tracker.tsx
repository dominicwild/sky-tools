"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function send(event: Record<string, string | number>): void {
  navigator.sendBeacon("/api/visit", new Blob([JSON.stringify(event)], { type: "application/json" }));
}

function utmParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

function Tracker() {
  const pathname = usePathname();
  const previousUrl = useRef<string | null>(null);

  useEffect(() => {
    const view = crypto.randomUUID();
    const startedAt = performance.now();
    let left = false;

    send({
      kind: "view",
      view,
      path: pathname,
      title: document.title,
      referrer: previousUrl.current ?? document.referrer,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      utmSource: utmParam("utm_source"),
      utmMedium: utmParam("utm_medium"),
      utmCampaign: utmParam("utm_campaign"),
    });
    previousUrl.current = window.location.href;

    function leave() {
      if (left) return;
      left = true;
      send({ kind: "leave", view, ms: Math.round(performance.now() - startedAt) });
    }
    function leaveWhenHidden() {
      if (document.visibilityState === "hidden") leave();
    }

    document.addEventListener("visibilitychange", leaveWhenHidden);
    window.addEventListener("pagehide", leave);
    return () => {
      document.removeEventListener("visibilitychange", leaveWhenHidden);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, [pathname]);

  return null;
}

export function VisitTracker() {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") return null;
  return <Tracker />;
}
