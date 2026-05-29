import { Link } from '@tanstack/react-router';
import type { Competitor } from '@/lib/competitors';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

/**
 * Shared template for every /vs-<competitor-slug> page. Data-driven from
 * assets/src/lib/competitors.ts. Claims here are factual; framing is fair,
 * not absolute. Trademark/legal disclaimer below the comparison table.
 */
export function CompetitorView({ competitor }: { competitor: Competitor }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title={competitor.metaTitle}
        description={competitor.metaDescription}
        path={`/${competitor.slug}`}
      />
      <LandingNav />

      <main className="page-enter pt-20">
        <section className="mx-auto max-w-3xl px-6 pt-20 pb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-amber">Comparison</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-text-primary sm:text-5xl">
            DailyBrew vs {competitor.name}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
            {competitor.lede}
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-8">
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-cream-3 bg-cream-2/50">
                  <th className="px-5 py-3 font-semibold text-text-tertiary"> </th>
                  <th className="px-5 py-3 font-serif font-semibold text-coffee">DailyBrew</th>
                  <th className="px-5 py-3 font-semibold text-text-primary">{competitor.name}</th>
                </tr>
              </thead>
              <tbody>
                {competitor.rows.map((row) => (
                  <tr key={row.dimension} className="border-b border-cream-3 last:border-0">
                    <th className="px-5 py-4 font-medium text-text-primary">{row.dimension}</th>
                    <td className="px-5 py-4 text-text-secondary">{row.dailybrew}</td>
                    <td className="px-5 py-4 text-text-secondary">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-text-tertiary">
            Comparison based on publicly available product information and may change as products
            evolve. Names and trademarks belong to their respective owners.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-10">
          <div className="rounded-2xl border border-cream-3 bg-cream-2/50 p-6">
            <h2 className="font-serif text-xl font-semibold text-text-primary">
              Which should you choose?
            </h2>
            <p className="mt-3 leading-7 text-text-secondary">{competitor.summary}</p>
            <p className="mt-3 leading-7 text-text-secondary">
              See how DailyBrew&apos;s{' '}
              <Link
                to="/three-factor-attendance"
                className="text-coffee underline underline-offset-2"
              >
                three-factor verification
              </Link>{' '}
              works, or{' '}
              <Link to="/stop-buddy-punching" className="text-coffee underline underline-offset-2">
                how it stops buddy punching
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20">
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-10 text-center shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <h2 className="font-serif text-2xl font-semibold text-text-primary">
              Try the no-biometric alternative
            </h2>
            <p className="mx-auto mt-3 max-w-md text-text-secondary">
              Free for up to 10 active employees. No face scans, no GPS, no contract.
            </p>
            <Link
              to="/sign-up"
              className="mt-6 inline-block rounded-2xl bg-coffee px-6 py-3 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
            >
              Create your free account
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
