import { Link } from '@tanstack/react-router';

/**
 * Companion post to the anomaly-detection feature. Explains the single
 * boolean ("have we seen this device before for this employee?"), why
 * first-time-on-this-device is the right trigger, what the alert looks
 * like, and how to triage. Espresso+ feature gating noted at the end.
 */
export function TheNewDeviceAlertPost() {
  return (
    <div className="space-y-6 text-[16px] leading-relaxed text-text-secondary">
      <p>
        For most weeks, every staff phone is the same one as last week. Lyhour clocks in from her
        iPhone, Sokha from his Pixel. The pattern is so steady that when it breaks, the break is
        the signal.
      </p>
      <p>
        That&apos;s the new-device alert. The moment someone clocks in (or out) from a phone
        they&apos;ve never used before on this account, DailyBrew pings the owner — push,
        Telegram, and now email in parallel, so it reaches you whether the app is open,
        you&apos;re in the kitchen, or you only check your inbox in the morning.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        Why first-time-on-this-device is the right trigger
      </h2>
      <p>
        GPS tells you a phone is near the shop. Face recognition tells you who&apos;s in front of
        the camera. Neither tells you whether the phone clocking in <em>belongs to the person
        it&apos;s clocking in for</em>.
      </p>
      <p>
        The device binding does. The first phone a staff member uses becomes their baseline. Every
        later punch from the same phone is silently approved. A new phone is the only thing that
        surfaces — and that surface is small enough to look at calmly, instead of drowning you in
        low-signal noise.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        What an alert looks like
      </h2>
      <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 my-4">
        <p className="font-mono text-[14px] leading-relaxed text-text-primary mb-0">
          ⚠️ <strong>New device used</strong>
          <br />
          Lyhour Huy checked in from a new device.
          <br />
          Device: iPhone 17 Pro
          <br />
          Time: Apr 10, 09:00
        </p>
      </div>
      <p>
        You get one push, one Telegram message, one email — for the same event. Not three separate
        decisions to make, just three places the same fact can reach you.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        When it&apos;s nothing — and when it isn&apos;t
      </h2>
      <ul className="space-y-3 list-disc pl-6">
        <li>
          <strong>Likely fine:</strong> the staff member upgraded phones over the weekend. New
          iPhone, same person. You reset their device binding in two taps (Console → Employees →
          Reset device) and the new phone becomes the baseline.
        </li>
        <li>
          <strong>Worth a look:</strong> the alert lands during a shift you didn&apos;t expect
          anyone new to start. Or the device label reads &quot;Android&quot; for a barista
          who&apos;s been on iPhone for two years. Or the alert lands twice in one morning for two
          different people.
        </li>
        <li>
          <strong>The buddy-punching tell:</strong> the new device is the <em>same</em> across two
          employees, two days in a row. That&apos;s the shared phone in the back room — and
          it&apos;s exactly the kind of pattern a normal time-clock report would hide.
        </li>
      </ul>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        Why we added email too
      </h2>
      <p>
        Push notifications get muted. Telegram chats get archived. The morning-rush owner
        who&apos;s elbow-deep in milk steamers doesn&apos;t read either until the rush is over —
        and by then the alert is buried under a hundred other notifications.
      </p>
      <p>
        Email is the durable record. You can search it weeks later, share it with a manager,
        forward it to your accountant if it turns into a wage dispute. The three channels
        aren&apos;t redundancy — they&apos;re three different time horizons.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        What this isn&apos;t
      </h2>
      <p>
        This isn&apos;t biometric. It isn&apos;t location tracking. It isn&apos;t a black-box
        &quot;trust score.&quot; It&apos;s a single boolean:{' '}
        <em>have we seen this device on this employee before?</em> When the answer is no for the
        first time, we tell you. That&apos;s the whole feature.
      </p>
      <p>
        Available on Espresso and Double Espresso, on by default. No setting to enable — the
        moment a workspace has a paid plan and a baseline device on file, the detector starts
        watching.
      </p>
      <p>
        Read the{' '}
        <Link
          to="/blog/$slug"
          params={{ slug: 'three-factor-attendance' }}
          className="text-coffee no-underline hover:underline"
        >
          three-factor explainer
        </Link>{' '}
        for the verification stack behind the alert, or{' '}
        <Link to="/pricing" className="text-coffee no-underline hover:underline">
          check pricing
        </Link>{' '}
        to see what else Espresso unlocks.
      </p>
    </div>
  );
}
