import Link from "next/link";

const LINKS = [
  { href: "/three-factor-attendance", label: "How it works" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-glass-border bg-glass-bg backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-xl font-semibold text-coffee no-underline">
          DailyBrew
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary no-underline transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden text-sm font-medium text-text-secondary no-underline transition-colors hover:text-text-primary sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-coffee px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            Start free
          </Link>
        </div>
      </nav>
    </header>
  );
}
