import { Link } from '@tanstack/react-router';

/**
 * Feature explainer for the WorkspaceSetting.telegramCheckinAlertsEnabled
 * toggle (PR #?? — set up under Settings → Telegram notifications). Live
 * Telegram ping on every staff check-in/out. Off by default because the
 * noise profile is high; this post explains when to turn it on.
 *
 * Device-verification copy here is intentionally precise: same-day
 * consistency, not per-lifetime binding (corrected after a copy review).
 */
export function LiveCheckinAlertsOnTelegramPost() {
  return (
    <div className="space-y-6 text-[16px] leading-relaxed text-text-secondary">
      <p>
        You can already get Telegram notifications for leave requests, shift changes, closures,
        and the daily summary. Now there&apos;s one more: live check-in/out pings, the moment
        they happen.
      </p>
      <p>It&apos;s off by default. Here&apos;s why — and why you might still want it on.</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        Why off by default
      </h2>
      <p>
        A 5-person café with normal opening and closing shifts sees about 10 punches a day. Add
        lunch breaks (some workspaces clock those too) and you&apos;re at 20. That&apos;s 20
        Telegram messages a day, just from one shop, on top of whatever else lives in your
        inbox.
      </p>
      <p>
        For most owners that&apos;s too much signal-shaped noise. The daily summary at 6pm tells
        you who showed up, who was late, who&apos;s still on a long shift — without 20
        individual pings.
      </p>
      <p>
        But if you&apos;re not at the shop, or if you&apos;re scaling to a second location and
        want to feel the pulse of the place from across town, the live pings turn that into a
        steady, low-resolution sense of &quot;yes, the morning crew is in&quot; without staring
        at the dashboard.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        What an alert looks like
      </h2>
      <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 my-4 space-y-2">
        <p className="font-mono text-[14px] leading-relaxed text-text-primary mb-0">
          🟢 <strong>Sokha Sun checked in</strong> at 06:32
        </p>
        <p className="font-mono text-[14px] leading-relaxed text-text-primary mb-0">
          🟠 <strong>Lyhour Huy checked out</strong> at 14:05
        </p>
      </div>
      <p>
        Two channels in parallel: your workspace Telegram group (if you&apos;ve set one up under
        Settings → Telegram notifications), and your personal Telegram DM (if you&apos;ve linked
        it on your profile). Same message, two destinations.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        How to turn it on
      </h2>
      <ol className="space-y-3 list-decimal pl-6">
        <li>
          Go to <strong>Settings → Telegram notifications</strong>
        </li>
        <li>
          Make sure the master &quot;Enable Telegram notifications&quot; toggle is on (it gates
          the workspace group send)
        </li>
        <li>
          Below the group chat setup, flip the new <strong>Live check-in/out alerts</strong>{' '}
          toggle
        </li>
        <li>Save</li>
      </ol>
      <p>
        That&apos;s the whole flow. Espresso plan and up — same plan tier as the rest of
        Telegram notifications.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        How this pairs with other alerts
      </h2>
      <p>DailyBrew already sends:</p>
      <ul className="space-y-3 list-disc pl-6">
        <li>
          <strong>Daily summary</strong> at 6pm (Telegram + email) — the digest that doesn&apos;t
          depend on this toggle
        </li>
        <li>
          <strong>New-device alert</strong> (Telegram + push + email) — fires when an employee
          uses a phone they&apos;ve never used before, which is the alert <em>you actually care
          about</em> most of the time. Covered in the{' '}
          <Link
            to="/blog/$slug"
            params={{ slug: 'the-new-device-alert' }}
            className="text-coffee no-underline hover:underline"
          >
            new-device alert post
          </Link>
          .
        </li>
        <li>
          <strong>Leave / shift / closure</strong> (Telegram + push + email) — administrative
          changes
        </li>
      </ul>
      <p>
        The live check-in pings sit alongside these. Most owners turn them on for a week, get a
        feel for the rhythm of their shop, then either keep them or turn them off. There&apos;s
        no wrong answer.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        What this doesn&apos;t do
      </h2>
      <p>
        This isn&apos;t device verification. The toggle just decides whether you <em>hear</em>{' '}
        about each check-in — it doesn&apos;t change which check-ins are <em>allowed</em>.
        DailyBrew&apos;s device verification (a separate Espresso feature) enforces same-day
        consistency: within a single day, one device per employee, and the check-out has to
        come from the same device as the check-in. Tomorrow that same employee can use a
        different phone — no problem, the constraint is per-day, not per-lifetime. That keeps
        active buddy punching from succeeding silently. The live alerts let you watch it work.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        A note on noise
      </h2>
      <p>
        If you turn this on and find yourself ignoring the pings, that&apos;s a signal to turn
        it off. Notifications you ignore train your brain to ignore the <em>channel</em>, which
        means the actually-urgent things (new-device alerts, leave requests) blend in. We left
        it off by default for that reason. Use it when the live feedback matters, mute it when
        it doesn&apos;t.
      </p>
    </div>
  );
}
