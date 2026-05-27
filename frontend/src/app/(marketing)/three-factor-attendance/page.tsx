import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, softwareApplicationSchema } from "@/lib/schema";
import { FaqSection } from "@/components/marketing/FaqSection";

export const metadata = pageMetadata("/three-factor-attendance");

const FACTORS = [
  {
    tag: "Something you have",
    title: "The verified device",
    body: "The first time a staff member clocks in, their phone is registered and bound to them. Later punches from a different phone simply don't count.",
  },
  {
    tag: "Somewhere you are",
    title: "The verified network",
    body: "Every clock-in records the IP. Punches from outside your shop's network are blocked — or flagged for review — so a clock-in from the parking lot on mobile data doesn't slip through.",
  },
  {
    tag: "Something you tap",
    title: "The NFC tag (beta)",
    body: "A coin-sized sticker by the espresso machine. The phone has to be within a few centimeters of a tag that lives only at your shop. QR is the universal fallback today.",
  },
];

const CONTRASTS = [
  {
    title: "vs. face recognition",
    body: "Face scans haul your staff's biometrics into a cloud and trigger laws like BIPA. We collect zero biometric data — we verify the device, not the body.",
  },
  {
    title: "vs. GPS geofencing",
    body: "GPS tells you a phone is near the shop, not whose phone — and it drains batteries with always-on location. The network check is more precise, with no tracking.",
  },
  {
    title: "vs. shared PINs",
    body: "A 4-digit PIN can be shouted across a stockroom. Binding every punch to a verified device means PIN-sharing simply doesn't work.",
  },
];

const FAQ = [
  {
    question: "How is this different from plain QR code attendance?",
    answer:
      "A QR code alone only proves someone was near the code — a photo of it can be scanned from the parking lot. DailyBrew's QR is already bound to the verified device and your shop's network, and the NFC tap adds a third physical factor.",
  },
  {
    question: "Do you collect biometric data?",
    answer:
      "No. There are no face scans or fingerprints. We verify which device is being used via a token registered the first time a staff member clocks in — no biometric data is collected, stored, or processed.",
  },
  {
    question: "What if a staff member forgets their phone?",
    answer:
      "Their manager clocks them in from the dashboard. It's logged as an override with the manager's name, the time, and a reason — visible in the audit trail. No PIN to share.",
  },
  {
    question: "Is NFC tap available now?",
    answer:
      "NFC tap-to-clock-in is in beta. QR + device + IP verification is fully shipped and free for teams of 10 or fewer, and the NFC tap runs through the same verification stack.",
  },
];

export default function ThreeFactorAttendancePage() {
  return (
    <>
      <JsonLd data={softwareApplicationSchema()} />
      <JsonLd
        data={breadcrumbSchema([{ name: "Three-factor attendance", path: "/three-factor-attendance" }])}
      />

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-amber">
          The honest time clock
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-text-primary sm:text-5xl">
          Three-factor attendance
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
          Your bank doesn&apos;t trust your password alone — it asks for your phone too. We do the
          same for clock-ins: the verified <strong>device</strong>, the verified{" "}
          <strong>network</strong>, and a physical <strong>tap</strong>. Buddy punching becomes
          mechanically impossible — without a single biometric.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="rounded-2xl bg-coffee px-6 py-3 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            Start free
          </Link>
          <Link
            href="/stop-buddy-punching"
            className="rounded-2xl border border-glass-border bg-glass-bg px-6 py-3 text-sm font-medium text-text-primary no-underline transition-colors hover:bg-cream-3"
          >
            Stop buddy punching
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-6 py-12 sm:grid-cols-3">
        {FACTORS.map((factor) => (
          <div key={factor.title} className="glass-card p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
              {factor.tag}
            </p>
            <h2 className="mt-2 font-serif text-xl font-semibold text-text-primary">
              {factor.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">{factor.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-8 text-center font-serif text-3xl font-semibold text-text-primary">
          Why three factors beat one
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {CONTRASTS.map((item) => (
            <div key={item.title} className="rounded-2xl border border-cream-3 bg-cream-2 p-6">
              <h3 className="font-semibold text-text-primary">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-text-secondary">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <FaqSection items={FAQ} />

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="glass-card p-10 text-center">
          <h2 className="font-serif text-2xl font-semibold text-text-primary">
            Honest timesheets before the morning rush
          </h2>
          <p className="mx-auto mt-3 max-w-md text-text-secondary">
            Free for teams of 10 or fewer. No credit card, no hardware to buy.
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
