import { createFileRoute, Link } from '@tanstack/react-router';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 pt-28 pb-16 px-6 md:px-8 max-w-3xl mx-auto w-full page-enter">
        <h1 className="text-[30px] font-semibold text-text-primary font-serif mb-2">
          Privacy Policy
        </h1>
        <p className="text-[14px] text-text-tertiary mb-8">
          Last updated: March 2026
        </p>

        <div className="glass-card !rounded-2xl p-6 md:p-8 hover:!transform-none space-y-6">
          <Section title="1. Information we collect">
            <p>
              When you create an account, we collect your email address and, if
              provided, your name. When employees check in via QR code, we
              record the check-in time and IP address for audit purposes.
            </p>
          </Section>

          <Section title="2. How we use your information">
            <p>
              We use your data to provide the DailyBrew service: tracking
              attendance, managing shifts, and processing leave requests. We do
              not sell your data to third parties.
            </p>
          </Section>

          <Section title="3. Payment processing">
            <p>
              Payments are processed by Paddle (paddle.com), our merchant of
              record. We do not store credit card details. Paddle handles all
              payment data under their own privacy policy.
            </p>
          </Section>

          <Section title="4. Authentication">
            <p>
              We support email/password, Google, and Apple sign-in. When using
              OAuth providers, we receive your email address and provider ID. We
              do not access your contacts, calendar, or any other data from
              these providers.
            </p>
          </Section>

          <Section title="5. Data retention">
            <p>
              Your data is retained as long as your account is active. You may
              request deletion of your account and all associated data by
              contacting us.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use JWT tokens stored in HTTP-only cookies for authentication.
              We do not use tracking cookies or third-party analytics.
            </p>
          </Section>

          <Section title="7. Contact">
            <p>
              For privacy-related inquiries, email us at{' '}
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
            className="text-[15px] text-text-secondary hover:text-coffee no-underline transition-colors"
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
      <h3 className="text-[16px] font-semibold text-text-primary mb-2">
        {title}
      </h3>
      <div className="text-[15px] text-text-secondary leading-relaxed">
        {children}
      </div>
    </div>
  );
}
