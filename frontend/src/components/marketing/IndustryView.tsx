import Link from "next/link";
import type { Industry } from "@/lib/industries";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, softwareApplicationSchema } from "@/lib/schema";
import { FaqSection } from "@/components/marketing/FaqSection";

const FAQ = [
  {
    question: "Is it really free?",
    answer:
      "Yes — free forever for teams of 10 or fewer, with no credit card required. Paid plans add device verification, IP restriction, leave management, and more.",
  },
  {
    question: "Do staff need to install an app?",
    answer:
      "No. Staff scan a QR code with their phone's camera and check in from the web — nothing to download. NFC tap-to-clock-in is in beta.",
  },
  {
    question: "How does it stop buddy punching?",
    answer:
      "Each clock-in is bound to a verified device and your shop's network. A punch from someone else's phone, or from off your network, won't count — no biometrics needed.",
  },
  {
    question: "What if someone forgets their phone?",
    answer:
      "A manager clocks them in from the dashboard. It's recorded as an override with the manager's name, time, and reason in the audit trail.",
  },
];

export function IndustryView({ industry }: { industry: Industry }) {
  return (
    <>
      <JsonLd data={softwareApplicationSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: industry.label, path: `/${industry.slug}` }])} />

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-amber">
          {industry.eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-text-primary sm:text-5xl">
          {industry.metaTitle}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
          {industry.lede}
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
            How verification works
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-6 py-12 sm:grid-cols-3">
        {industry.painPoints.map((point) => (
          <div key={point.title} className="glass-card p-6">
            <h2 className="font-serif text-lg font-semibold text-text-primary">{point.title}</h2>
            <p className="mt-2 text-sm leading-7 text-text-secondary">{point.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h2 className="font-serif text-3xl font-semibold text-text-primary">
          Verified clock-ins, built for {industry.name}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
          Every punch is bound to a verified device and your shop&apos;s network — the same
          three-factor stack behind{" "}
          <Link href="/stop-buddy-punching" className="text-coffee underline underline-offset-2">
            stopping buddy punching
          </Link>
          . No biometrics, no face scans. Add{" "}
          <Link href="/features" className="text-coffee underline underline-offset-2">
            shifts, leave, and notifications
          </Link>{" "}
          when you need them.
        </p>
      </section>

      <FaqSection items={FAQ} />

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="glass-card p-10 text-center">
          <h2 className="font-serif text-2xl font-semibold text-text-primary">
            Honest timesheets for {industry.name}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-text-secondary">
            Free for teams of 10 or fewer. No hardware, no biometrics, no contract.
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
