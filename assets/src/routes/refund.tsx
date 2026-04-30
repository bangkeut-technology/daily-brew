import { createFileRoute, Link } from '@tanstack/react-router';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/refund')({
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title="Refund policy"
        description="DailyBrew refund policy: refund eligibility, how to request a refund, processing times, and the difference between cancellation and refund."
        path="/refund"
      />
      <LandingNav />
      <main className="flex-1 pt-28 pb-16 px-6 md:px-8 max-w-3xl mx-auto w-full page-enter">
        <h1 className="text-[30px] font-semibold text-text-primary font-serif mb-2">
          Refund Policy
        </h1>
        <p className="text-[14px] text-text-tertiary mb-8">
          Last updated: April 2026
        </p>

        <div className="glass-card !rounded-2xl p-6 md:p-8 hover:!transform-none space-y-6">
          <Section title="1. Overview">
            <p>
              DailyBrew offers paid subscription plans (Espresso and Double
              Espresso) billed monthly or annually through Paddle, our merchant
              of record. This policy explains when refunds are available, how
              to request one, and how cancellations differ from refunds.
            </p>
          </Section>

          <Section title="2. 14-day money-back guarantee">
            <p>
              You may request a full refund within{' '}
              <strong>14 days</strong> of your initial paid subscription
              purchase, for any reason. This applies to both monthly and annual
              plans. After the 14-day window, the standard refund rules below
              apply.
            </p>
          </Section>

          <Section title="3. Refunds after the 14-day window">
            <p className="mb-3">
              Outside the 14-day window, refunds are evaluated case by case. We
              generally issue refunds (full or prorated) in the following
              cases:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Service was unavailable or substantially impaired for an
                extended period and we were unable to resolve it.
              </li>
              <li>
                Duplicate charges or accidental renewal where the workspace
                showed no usage in the new billing period.
              </li>
              <li>
                Billing errors on our side.
              </li>
            </ul>
            <p className="mt-3">
              Outside these cases, we do not refund unused time on monthly
              plans. For annual plans, prorated refunds may be granted at our
              discretion.
            </p>
          </Section>

          <Section title="4. Cancellation vs refund">
            <p>
              Cancelling your subscription stops future renewals — it does not
              automatically issue a refund for the current period. After
              cancellation, your workspace retains access to paid features
              until the end of the current billing period, then reverts to the
              free plan. To request a refund in addition to cancelling, contact
              us using the steps below.
            </p>
          </Section>

          <Section title="5. How to request a refund">
            <p className="mb-3">
              Email{' '}
              <a
                href="mailto:support@mail.dailybrew.work"
                className="text-coffee font-medium no-underline hover:text-coffee-light"
              >
                support@mail.dailybrew.work
              </a>{' '}
              with the following:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The email address on your DailyBrew account</li>
              <li>The workspace name</li>
              <li>The Paddle transaction ID or invoice number</li>
              <li>A short description of why you are requesting a refund</li>
            </ul>
            <p className="mt-3">
              We respond to refund requests within 3 business days.
            </p>
          </Section>

          <Section title="6. Processing times">
            <p>
              Approved refunds are issued through Paddle to the original
              payment method. Card refunds typically appear within 5–10
              business days, depending on your bank. PayPal refunds typically
              appear within 1–3 business days. Paddle handles all payment
              processing — DailyBrew does not store card details.
            </p>
          </Section>

          <Section title="7. Free plan">
            <p>
              The free plan is offered at no cost and is not subject to
              refunds. Downgrading from a paid plan to the free plan does not
              trigger a refund of unused paid time.
            </p>
          </Section>

          <Section title="8. Chargebacks">
            <p>
              If you initiate a chargeback with your bank or card issuer
              instead of contacting us first, your DailyBrew account may be
              suspended pending resolution. We strongly recommend reaching out
              to us first — most disputes can be resolved within a few business
              days.
            </p>
          </Section>

          <Section title="9. Changes to this policy">
            <p>
              We may update this refund policy from time to time. Changes apply
              to purchases made after the update date. Active subscribers will
              be notified by email of material changes at least 14 days before
              they take effect.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              For refund requests or questions about this policy, email{' '}
              <a
                href="mailto:support@mail.dailybrew.work"
                className="text-coffee font-medium no-underline hover:text-coffee-light"
              >
                support@mail.dailybrew.work
              </a>
              . See also our{' '}
              <Link
                to="/terms"
                className="text-coffee font-medium no-underline hover:text-coffee-light"
              >
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-coffee font-medium no-underline hover:text-coffee-light"
              >
                Privacy Policy
              </Link>
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
