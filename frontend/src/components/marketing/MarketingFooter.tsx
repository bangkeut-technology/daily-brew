import Link from "next/link";

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { href: "/three-factor-attendance", label: "Three-factor attendance" },
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/stop-buddy-punching", label: "Stop buddy punching" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/guides", label: "Guides" },
      { href: "/faq", label: "FAQ" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/refund", label: "Refund policy" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-cream-3">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link href="/" className="font-serif text-lg font-semibold text-coffee no-underline">
            DailyBrew
          </Link>
          <p className="mt-3 max-w-xs text-sm text-text-tertiary">
            Honest timesheets for cafés and small shops. Verified clock-ins, no biometrics.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              {col.heading}
            </h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary no-underline transition-colors hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-cream-3">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-text-tertiary">
          © {new Date().getFullYear()} DailyBrew — staff attendance for cafés and small shops.
        </div>
      </div>
    </footer>
  );
}
