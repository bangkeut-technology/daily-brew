import Link from "next/link";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-cream-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-serif text-xl font-semibold text-coffee no-underline">
            DailyBrew
          </Link>
          <nav className="flex items-center gap-5 text-sm text-text-secondary">
            <Link href="/blog" className="no-underline hover:text-text-primary">
              Blog
            </Link>
            <Link href="/pricing" className="no-underline hover:text-text-primary">
              Pricing
            </Link>
            <Link
              href="/sign-up"
              className="rounded-xl bg-coffee px-4 py-2 font-medium text-white no-underline transition-opacity hover:opacity-90"
            >
              Start free
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">{children}</main>
      <footer className="border-t border-cream-3">
        <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-text-tertiary">
          © {new Date().getFullYear()} DailyBrew — staff attendance for cafés and small shops.
        </div>
      </footer>
    </div>
  );
}
