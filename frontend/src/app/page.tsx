import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <section className="glass-card animate-fade-in-up w-full max-w-xl p-10 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-amber">
          Next.js migration · Phase 0
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-text-primary">
          DailyBrew
        </h1>
        <p className="mt-4 text-text-secondary">
          Staff attendance &amp; leave tracking for restaurants. This is the new
          Next.js frontend scaffold — design tokens, glass styling, and the
          Symfony API proxy are wired up.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-2xl bg-coffee px-5 py-2.5 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
          <a
            href="https://dailybrew.work"
            className="rounded-2xl border border-glass-border bg-glass-bg px-5 py-2.5 text-sm font-medium text-text-primary no-underline transition-colors hover:bg-cream-3"
          >
            Current site
          </a>
        </div>
      </section>
    </main>
  );
}
