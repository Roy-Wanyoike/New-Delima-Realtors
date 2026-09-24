import Link from "next/link";
import { Compass, Home, Phone } from "lucide-react";

// Delima Realtors 3.0 — branded 404 (issue #14 follow-up).
// Rendered inside the root layout but outside the app shell, so it carries its
// own minimal chrome — on-brand evergreen/sun palette, no shell dependency.

export default function NotFound() {
  return (
    <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="eyebrow justify-center">Delima Realtors · Nairobi</p>
        <p className="mt-6 font-display text-7xl sm:text-8xl font-extrabold tracking-tight text-gradient-brand">
          404
        </p>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold">
          This address isn&apos;t on our maps
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          The page you&apos;re looking for was moved, sold, or never existed.
          Our listings, though, are very real — start again from the homepage or
          browse the neighbourhood atlas.
        </p>

        <div className="card-modern mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 p-4">
          <Link
            href="/"
            className="btn-sun inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          >
            <Home className="size-4" aria-hidden />
            Back to homepage
          </Link>
          <Link
            href="/#properties"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold text-brand hover:bg-brand-soft transition-colors"
          >
            <Compass className="size-4" aria-hidden />
            Browse listings
          </Link>
          <a
            href="tel:+254727523752"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-brand hover:text-sun-deep transition-colors"
          >
            <Phone className="size-4" aria-hidden />
            +254 727 523 752
          </a>
        </div>
      </div>
    </main>
  );
}
