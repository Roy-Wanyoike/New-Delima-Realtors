"use client";

import { useEffect } from "react";

/**
 * Production-only service worker registration (issue #67).
 *
 * - Registers the hand-written /sw.js once the page loads.
 * - Next inlines process.env.NODE_ENV at build time, so this never runs
 *   in development (keeps dev hot-reload free of SW caching).
 * - Renders nothing and never crashes the app on failure.
 */
export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        console.warn("[delima] service worker registration failed:", error);
      }
    };

    void register();
  }, []);

  return null;
}
