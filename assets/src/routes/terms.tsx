import { createFileRoute, Link } from '@tanstack/react-router';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title="Terms of use"
        description="Terms governing the use of DailyBrew, including subscription plans, QR check-in, data handling, and account responsibilities."
        path="/terms"
      />
      <LandingNav />
      <main className="flex-1 pt-28 pb-16 px-6 md:px-8 max-w-3xl mx-auto w-full page-enter">
        <h1 className="text-[30px] font-semibold text-text-primary font-serif mb-2">
          Terms of Use
        </h1>
        <p className="text-[14px] text-text-tertiary mb-8">
          Last updated: April 2026
        </p>

        <div className="glass-card !rounded-2xl p-6 md:p-8 hover:!transform-none space-y-6">
          <Section title="1. Service description">
            <p>
              DailyBrew provides staff attendance tracking and leave management
              tools for restaurants. The service includes QR-based check-in,
              shift management, leave request workflows, closure scheduling,
              and dashboards for both restaurant owners and employees.
            </p>
          </Section>

          <Section title="2. Account responsibilities">
            <p>
              You are responsible for maintaining the security of your account
              credentials. You must not share your login or allow unauthorized
              access to your workspace. You are responsible for all activity
              under your account. Workspace owners are responsible for the
              accuracy of employee records and shift schedules within their
              workspace.
            </p>
          </Section>

          <Section title="3. Subscription plans">
            <p className="mb-3">
              DailyBrew offers the following plans:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Free plan:</strong> up to 10 active employees per
                workspace. Includes QR check-in, shift management, attendance
                tracking, and closure scheduling.
              </li>
              <li>
                <strong>Espresso plan ($12.99/month or $129/year):</strong> up
                to 20 active employees. Adds IP restriction, device
                verification, geofencing for check-in, per-day shift schedules,
                leave request management, employee username for BasilBook staff
                linking, push notifications, email notifications, and daily
                attendance summaries.
              </li>
              <li>
                <strong>
                  Double Espresso plan ($39.99/month or $399/year):
                </strong>{' '}
                unlimited employees. Includes everything in Espresso plus
                priority support.
              </li>
            </ul>
            <p className="mt-3">
              Paid plans are billed through Paddle (our merchant of record).
              You may cancel at any time; access to paid features continues
              until the end of the current billing period. We reserve the right
              to adjust pricing with 30 days' notice to active subscribers.
            </p>
          </Section>

          <Section title="4. QR check-in and attendance">
            <p>
              Each workspace is assigned a unique QR code. Employees check in
              and out by scanning this QR code through the DailyBrew app.
              Attendance records are limited to one check-in per employee per
              day. Late arrivals and early departures are automatically detected
              based on the employee's assigned shift. Workspace owners may
              enable additional check-in controls (IP restriction, device
              verification, geofencing) on eligible plans.
            </p>
          </Section>

          <Section title="5. Leave requests">
            <p>
              Employees may submit leave requests (paid or unpaid, full-day or
              partial-day) through the service. Leave requests cannot overlap
              with closure periods or existing approved/pending leave.
              Workspace owners approve or reject requests. Employees may cancel
              their own pending requests.
            </p>
          </Section>

          <Section title="6. Acceptable use">
            <p>
              You may not use DailyBrew for unlawful purposes, to store
              sensitive personal data beyond what the service requires, to
              attempt to circumvent check-in verification controls, or to
              interfere with the service's operation. We reserve the right to
              suspend or terminate accounts that violate these terms.
            </p>
          </Section>

          <Section title="7. Data and privacy">
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

          <Section title="8. Intellectual property">
            <p>
              DailyBrew and its original content, features, and functionality
              are owned by DailyBrew and are protected by applicable
              intellectual property laws. Your data remains yours — we claim no
              ownership over employee records, attendance data, or any content
              you provide through the service.
            </p>
          </Section>

          <Section title="9. Limitation of liability">
            <p>
              DailyBrew is provided "as is" without warranties of any kind. We
              do not guarantee uninterrupted or error-free service. We are not
              liable for lost data, missed check-ins, incorrect late/early
              detection, or business decisions made based on dashboard data.
              Our total liability is limited to the amount you paid in the
              prior 12 months.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              You may delete your account at any time. We may suspend or
              terminate your access for violation of these terms or for
              non-payment. Upon termination, your data will be retained for 30
              days before permanent deletion, unless you request immediate
              deletion.
            </p>
          </Section>

          <Section title="11. Changes to terms">
            <p>
              We may update these terms from time to time. Continued use of the
              service after changes constitutes acceptance. We will notify
              registered users of material changes via email at least 14 days
              before they take effect.
            </p>
          </Section>

          <Section title="12. Contact">
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
