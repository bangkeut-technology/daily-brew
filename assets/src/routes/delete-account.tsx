import { createFileRoute, Link } from '@tanstack/react-router';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { Trash2, ShieldCheck, Mail } from 'lucide-react';

export const Route = createFileRoute('/delete-account')({
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title="Delete your account"
        description="Request deletion of your DailyBrew account and all associated data including attendance records, workspaces, and employee profiles."
        path="/delete-account"
      />
      <LandingNav />
      <main className="flex-1 pt-28 pb-16 px-6 md:px-8 max-w-3xl mx-auto w-full page-enter">
        <h1 className="text-[30px] font-semibold text-text-primary font-serif mb-2">
          Delete your account
        </h1>
        <p className="text-[14px] text-text-tertiary mb-8">
          Request deletion of your DailyBrew account and all associated data.
        </p>

        <div className="glass-card !rounded-2xl p-6 md:p-8 hover:!transform-none space-y-6">
          <Section
            icon={<Trash2 size={18} className="text-red" />}
            title="How to delete your account"
          >
            <p className="mb-3">
              You can delete your account directly from the app:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Sign in to DailyBrew.</li>
              <li>
                Go to <strong>Profile</strong> (tap your avatar or navigate to
                the profile page).
              </li>
              <li>
                Scroll to the <strong>Delete account</strong> section at the
                bottom.
              </li>
              <li>
                Type <strong>DELETE</strong> to confirm, then tap{' '}
                <strong>Delete permanently</strong>.
              </li>
            </ol>
          </Section>

          <Section
            icon={<ShieldCheck size={18} className="text-green" />}
            title="What data is deleted"
          >
            <p className="mb-3">
              When you delete your account, the following data is permanently
              removed:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Your user profile (email, name, OAuth connections).
              </li>
              <li>
                All workspaces you own, including their employees, shifts,
                closures, and settings.
              </li>
              <li>
                All attendance records associated with your workspaces.
              </li>
              <li>
                All leave requests associated with your workspaces.
              </li>
              <li>
                Your employee links in other workspaces (you will be
                unlinked).
              </li>
              <li>
                All registered device tokens for push notifications.
              </li>
            </ul>
            <p className="mt-3">
              This action is irreversible. Once deleted, your data cannot be
              recovered.
            </p>
          </Section>

          <Section
            icon={<Mail size={18} className="text-coffee" />}
            title="Cannot access your account?"
          >
            <p>
              If you are unable to sign in and want your account deleted, email
              us at{' '}
              <a
                href="mailto:support@mail.dailybrew.work?subject=Account%20deletion%20request"
                className="text-coffee font-medium no-underline hover:text-coffee-light"
              >
                support@mail.dailybrew.work
              </a>{' '}
              with the subject line "Account deletion request" and the email
              address associated with your account. We will process your request
              within 7 business days.
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

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-[16px] font-semibold text-text-primary">
          {title}
        </h3>
      </div>
      <div className="text-[15px] text-text-secondary leading-relaxed pl-[26px]">
        {children}
      </div>
    </div>
  );
}
