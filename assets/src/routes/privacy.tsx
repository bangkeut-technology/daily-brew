import { createFileRoute, Link } from '@tanstack/react-router';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title="Privacy policy"
        description="How DailyBrew collects, uses, and protects your data. Learn about our privacy practices for attendance tracking, notifications, and payment processing."
        path="/privacy"
      />
      <LandingNav />
      <main className="flex-1 pt-28 pb-16 px-6 md:px-8 max-w-3xl mx-auto w-full page-enter">
        <h1 className="text-[30px] font-semibold text-text-primary font-serif mb-2">
          Privacy Policy
        </h1>
        <p className="text-[14px] text-text-tertiary mb-8">
          Last updated: April 2026
        </p>

        <div className="glass-card !rounded-2xl p-6 md:p-8 hover:!transform-none space-y-6">
          <Section title="1. Information we collect">
            <p className="mb-3">
              We collect different types of information depending on how you use
              DailyBrew:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Account data:</strong> email address, name, and password
                (or OAuth provider ID for Google/Apple sign-in).
              </li>
              <li>
                <strong>Workspace data:</strong> restaurant name, employee
                records (first name, last name, phone number, date of birth,
                join date), shift schedules, and closure periods.
              </li>
              <li>
                <strong>Attendance data:</strong> check-in and check-out
                timestamps, IP address at the time of check-in/out, and
                late/early-departure flags computed from shift schedules.
              </li>
              <li>
                <strong>Device data:</strong> when device verification is
                enabled (Espresso plan), we store a browser-generated device
                identifier and parsed device name for each check-in and
                check-out to prevent fraud.
              </li>
              <li>
                <strong>Location data:</strong> when geofencing is enabled
                (Espresso plan), your device sends its coordinates at
                check-in time. We use this only to verify you are within the
                configured radius and do not store your location history.
              </li>
              <li>
                <strong>Leave requests:</strong> dates, times (for partial-day
                leave), reason, and type (paid/unpaid).
              </li>
              <li>
                <strong>Push notification tokens:</strong> if you opt in to push
                notifications, we store your Expo push token and platform
                (iOS, Android, or web).
              </li>
            </ul>
          </Section>

          <Section title="2. How we use your information">
            <p className="mb-3">We use your data to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Provide the DailyBrew service: tracking attendance, managing
                shifts, processing leave requests, and enforcing workspace
                settings (IP restriction, device verification, geofencing).
              </li>
              <li>
                Send notifications about leave request updates, shift changes,
                closures, and daily attendance summaries (via push notifications
                and email, Espresso plan and above).
              </li>
              <li>
                Detect and prevent fraudulent check-ins through device
                verification and IP validation.
              </li>
              <li>
                Improve and maintain the service, including troubleshooting and
                security monitoring.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your personal data with third
              parties for marketing purposes.
            </p>
          </Section>

          <Section title="3. Subscription and payment processing">
            <p>
              DailyBrew offers a free plan and paid subscription plans (Espresso
              and Double Espresso), billed monthly or annually. All payments are
              processed by Paddle (paddle.com), our merchant of record. We do
              not store credit card numbers or payment credentials. Paddle
              handles all payment data under their own{' '}
              <a
                href="https://www.paddle.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coffee font-medium no-underline hover:text-coffee-light"
              >
                privacy policy
              </a>
              .
            </p>
          </Section>

          <Section title="4. Authentication">
            <p>
              We support email/password, Google OAuth, and Apple sign-in. When
              using OAuth providers, we receive only your email address and
              provider-specific identifier. We do not access your contacts,
              calendar, or any other data from these providers.
            </p>
          </Section>

          <Section title="5. Notifications">
            <p>
              On paid plans, DailyBrew sends push notifications via the Expo
              push service and emails via Mailgun. You can unregister your
              device token at any time to stop receiving push notifications.
              Email notifications are sent to the address associated with your
              account.
            </p>
          </Section>

          <Section title="6. Data sharing">
            <p className="mb-3">
              We share data only with the following service providers, solely to
              operate DailyBrew:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Paddle</strong> — payment processing and subscription
                management.
              </li>
              <li>
                <strong>Expo</strong> — delivery of push notifications.
              </li>
              <li>
                <strong>Mailgun</strong> — delivery of transactional emails.
              </li>
              <li>
                <strong>Google / Apple</strong> — OAuth authentication only.
              </li>
            </ul>
          </Section>

          <Section title="7. Data retention">
            <p>
              Your data is retained as long as your account is active. Employee
              records are soft-deleted and can be restored by the workspace
              owner. You may request permanent deletion of your account and all
              associated data by contacting us. Upon deletion, all personal
              data, attendance records, and workspace data are permanently
              removed.
            </p>
          </Section>

          <Section title="8. Cookies and local storage">
            <p>
              We use JWT tokens for authentication and store workspace
              preferences in browser local storage for faster access. When
              device verification is enabled, a unique device identifier is
              stored in local storage. We do not use tracking cookies or
              third-party analytics.
            </p>
          </Section>

          <Section title="9. Your rights">
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>
                Request{' '}
                <Link
                  to="/delete-account"
                  className="text-coffee font-medium no-underline hover:text-coffee-light"
                >
                  deletion of your account and data
                </Link>
                .
              </li>
              <li>
                Unlink your user account from any employee record at any time.
              </li>
              <li>
                Unregister your device from push notifications.
              </li>
            </ul>
          </Section>

          <Section title="10. Contact">
            <p>
              For privacy-related inquiries, email us at{' '}
              <a
                href="mailto:support@mail.dailybrew.work"
                className="text-coffee font-medium no-underline hover:text-coffee-light"
              >
                support@mail.dailybrew.work
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
