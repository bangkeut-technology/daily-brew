import { createFileRoute, Link } from '@tanstack/react-router';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 pt-28 pb-16 px-6 md:px-8 max-w-3xl mx-auto w-full page-enter">
        <h1 className="text-[28px] font-semibold text-text-primary font-serif mb-2">
          Terms of Use
        </h1>
        <p className="text-[12px] text-text-tertiary mb-8">
          Last updated: March 2026
        </p>

        <div className="glass-card !rounded-2xl p-6 md:p-8 hover:!transform-none space-y-6">
          <Section title="1. Service description">
            <p>
              DailyBrew provides staff attendance tracking and leave management
              tools for restaurants. The service includes QR-based check-in,
              shift management, and a dashboard for restaurant owners.
            </p>
          </Section>

          <Section title="2. Account responsibilities">
            <p>
              You are responsible for maintaining the security of your account
              credentials. You must not share your login or allow unauthorized
              access to your workspace. You are responsible for all activity
              under your account.
            </p>
          </Section>

          <Section title="3. Free and paid plans">
            <p>
              The free plan allows up to 5 active employees. The Espresso plan
              removes this limit and adds additional features. Paid plans are
              billed monthly through Paddle. You may cancel at any time; access
              continues until the end of the billing period.
            </p>
          </Section>

          <Section title="4. Acceptable use">
            <p>
              You may not use DailyBrew for unlawful purposes, to store
              sensitive personal data beyond what the service requires, or to
              interfere with the service's operation. We reserve the right to
              suspend accounts that violate these terms.
            </p>
          </Section>

          <Section title="5. Data and privacy">
            <p>
              Your use of DailyBrew is also governed by our{' '}
              <Link
                to="/privacy"
                className="text-coffee font-medium no-underline hover:text-coffee-light"
              >
                Privacy Policy
              </Link>
              . By using the service, you agree to the collection and use of
              data as described therein.
            </p>
          </Section>

          <Section title="6. Limitation of liability">
            <p>
              DailyBrew is provided "as is". We do not guarantee uninterrupted
              service. We are not liable for lost data, missed check-ins, or
              business decisions made based on dashboard data. Our total
              liability is limited to the amount you paid in the prior 12 months.
            </p>
          </Section>

          <Section title="7. Changes to terms">
            <p>
              We may update these terms from time to time. Continued use of the
              service after changes constitutes acceptance. We will notify
              registered users of material changes via email.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              For questions about these terms, email us at{' '}
              <a
                href="mailto:support@dailybrew.work"
                className="text-coffee font-medium no-underline hover:text-coffee-light"
              >
                support@dailybrew.work
              </a>
              .
            </p>
          </Section>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-[13px] text-text-secondary hover:text-coffee no-underline transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-text-primary mb-2">
        {title}
      </h3>
      <div className="text-[13px] text-text-secondary leading-relaxed">
        {children}
      </div>
    </div>
  );
}
