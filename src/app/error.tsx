"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

// Delima Realtors 3.0 — route-level error boundary.
// Catches render/data errors inside the app and offers a retry, so a transient
// API hiccup never leaves buyers stranded on a blank screen.

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for observability tooling; safe no-op locally.
    console.error("[delima] route error", error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="card-modern w-full max-w-lg p-6 text-center">
        <p className="eyebrow justify-center">Something went wrong</p>
        <h1 className="mt-3 text-2xl font-bold text-ink">
          We hit a snag loading this view
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          It&apos;s usually temporary — a slow connection or a brief hiccup on
          our side. Try again, or head back to the homepage and pick up where
          you left off.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="btn-sun inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          >
            <RefreshCw className="size-4" aria-hidden />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold text-brand hover:bg-brand-soft transition-colors"
          >
            <Home className="size-4" aria-hidden />
            Homepage
          </Link>
        </div>

        {error?.digest ? (
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            reference: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
