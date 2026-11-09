"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type TrackerProps = {
  privatePaths: string[];
};

type ActiveView = { id: string; startedAt: number; left: boolean };

function send(event: Record<string, string | number>): void {
  if (navigator.webdriver) return;
  navigator.sendBeacon("/api/visit", new Blob([JSON.stringify(event)], { type: "application/json" }));
}

function utmParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

function privatePrefix(path: string, privatePaths: string[]): string | undefined {
  return privatePaths.find((prefix) => path.startsWith(prefix));
}

function recordedPath(path: string, privatePaths: string[]): string {
  const prefix = privatePrefix(path, privatePaths);
  return prefix === undefined ? path : `${prefix}[hidden]`;
}

function recordedReferrer(referrer: string, privatePaths: string[]): string {
  if (referrer === "") return referrer;
  const url = new URL(referrer);
  if (url.origin !== window.location.origin) return referrer;
  return url.origin + recordedPath(url.pathname, privatePaths);
}

function Tracker({ privatePaths }: TrackerProps) {
  const pathname = usePathname();
  const previousUrl = useRef<string | null>(null);
  const privatePathsAtMount = useRef(privatePaths);

  useEffect(() => {
    const privatePaths = privatePathsAtMount.current;

    function startView(): ActiveView {
      const id = crypto.randomUUID();
      send({
        kind: "view",
        view: id,
        path: recordedPath(pathname, privatePaths),
        title: privatePrefix(pathname, privatePaths) === undefined ? document.title : "",
        referrer: recordedReferrer(previousUrl.current ?? document.referrer, privatePaths),
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        utmSource: utmParam("utm_source"),
        utmMedium: utmParam("utm_medium"),
        utmCampaign: utmParam("utm_campaign"),
      });
      previousUrl.current = window.location.href;
      return { id, startedAt: performance.now(), left: false };
    }

    let active = startView();

    function leave() {
      if (active.left) return;
      active.left = true;
      send({ kind: "leave", view: active.id, ms: Math.round(performance.now() - active.startedAt) });
    }
    function leaveWhenHidden() {
      if (document.visibilityState === "hidden") leave();
    }
    function restartWhenRestoredFromCache(event: PageTransitionEvent) {
      if (event.persisted) active = startView();
    }

    document.addEventListener("visibilitychange", leaveWhenHidden);
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", restartWhenRestoredFromCache);
    return () => {
      document.removeEventListener("visibilitychange", leaveWhenHidden);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", restartWhenRestoredFromCache);
      leave();
    };
  }, [pathname]);

  return null;
}

export function VisitTracker({ privatePaths }: TrackerProps) {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") return null;
  return <Tracker privatePaths={privatePaths} />;
}
