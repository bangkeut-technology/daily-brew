import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, softwareApplicationSchema } from "@/lib/schema";
import { FaqSection } from "@/components/marketing/FaqSection";

export const metadata = pageMetadata("/stop-buddy-punching");

const STEPS = [
  {
    n: "01",
    title: "Bind each phone to one person",
    body: "The first clock-in registers a staff member's device. A punch from anyone else's phone won't count for them — so covering for a late colleague stops working.",
  },
  {
    n: "02",
    title: "Lock punches to your network",
    body: "Each clock-in records the IP. Off-network punches (mobile data from home or the parking lot) are blocked or flagged, so 'I clocked you in' over text fails.",
  },
  {
    n: "03",
    title: "Add a physical tap (beta)",
    body: "An NFC tag by the espresso machine means the phone must be physically at the shop. QR is the fallback today and runs through the same checks.",
  },
];

const FAQ = [
  {
    question: "What does buddy punching cost a small shop?",
    answer:
      "Research from the American Payroll Association has found roughly 75% of businesses are affected by time theft, and Nucleus Research estimates buddy punching costs employers around 2.2% of gross payroll. On a small team that's real money every month.",
  },
  {
    question: "Can I stop it without face scans or GPS tracking?",
    answer:
      "Yes — that's the point. DailyBrew binds clock-ins to a verified device and your shop's network. No biometrics are collected, and you don't need always-on GPS draining staff phones.",
  },
  {
    question: "Won't this annoy honest staff?",
    answer:
      "No. For staff on their own phone, on the shop WiFi, clocking in is a single scan or tap. The verification is invisible unless someone tries to punch for a colleague.",
  },
  {
    question: "What about forgotten phones or new devices?",
    answer:
      "Managers can clock someone in manually (logged as an audited override) and reset a device binding in two taps when a staff member gets a new phone.",
  },
];

export default function StopBuddyPunchingPage() {
  return (
    <>
      <JsonLd data={softwareApplicationSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: "Stop buddy punching", path: "/stop-buddy-punching" }])} />

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-amber">Time theft, solved</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-text-primary sm:text-5xl">
          How to stop buddy punching
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
          Buddy punching costs small businesses up to <strong>2.2% of gross payroll</strong>. You
          can stop it without spying on your staff — bind every clock-in to a verified device and
          your shop&apos;s network. No PINs to share, no face scans, no GPS.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="rounded-2xl bg-coffee px-6 py-3 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            Start free
          </Link>
          <Link
            href="/three-factor-attendance"
            className="rounded-2xl border border-glass-border bg-glass-bg px-6 py-3 text-sm font-medium text-text-primary no-underline transition-colors hover:bg-cream-3"
          >
            See how verification works
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="mb-8 text-center font-serif text-3xl font-semibold text-text-primary">
          Three layers that make it mechanically impossible
        </h2>
        <div className="space-y-4">
          {STEPS.map((step) => (
            <div key={step.n} className="glass-card flex gap-5 p-6">
              <span className="font-serif text-2xl font-semibold text-coffee">{step.n}</span>
              <div>
                <h3 className="font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-1 text-sm leading-7 text-text-secondary">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FaqSection items={FAQ} />

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="glass-card p-10 text-center">
          <h2 className="font-serif text-2xl font-semibold text-text-primary">
            Stop paying for hours nobody worked
          </h2>
          <p className="mx-auto mt-3 max-w-md text-text-secondary">
            Free for up to 10 active employees. Set it up before your next shift.
          </p>
          <Link
            href="/sign-up"
            className="mt-6 inline-block rounded-2xl bg-coffee px-6 py-3 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            Create your free account
          </Link>
        </div>
      </section>
    </>
  );
}
