import { Link } from '@tanstack/react-router';

/**
 * Plain TSX port of frontend/src/app/blog/three-factor-attendance/page.mdx,
 * so the post is reachable on the legacy SPA before the Phase 6 Next.js
 * cutover. Keep the two in lockstep when editing copy.
 */
export function ThreeFactorAttendancePost() {
  return (
    <div className="space-y-6 text-[16px] leading-relaxed text-text-secondary">
      <p>
        Your email, your work account, your phone itself — they all stopped trusting passwords
        alone years ago. A password plus a one-time code, a tap to approve, a fingerprint on a
        device the system already knows. That&apos;s two-factor authentication, and it&apos;s why
        stolen passwords rarely take over accounts anymore.
      </p>
      <p>
        Time clocks never got the memo. Most still trust a single factor: a PIN anyone can shout
        across a stockroom, a QR code anyone can photograph, or a face scan that hauls your
        staff&apos;s biometrics into someone&apos;s cloud. Each one is a single point of failure —
        and buddy punching is what failure looks like on a timesheet.
      </p>
      <p>
        DailyBrew brings the same idea to the café: <strong>three factors, not one.</strong>
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        The three factors
      </h2>
      <ul className="space-y-3 list-disc pl-6">
        <li>
          <strong>Something you have — the verified device.</strong> Within a single day, only
          one device per employee can clock in, and the check-out has to come from the same
          device as the check-in. No other employee can use that device that day either. The
          next day, they can use a different phone — the constraint is per-shift, not
          per-lifetime — so an upgraded phone or a borrowed device on a fresh day doesn&apos;t
          break anything.
        </li>
        <li>
          <strong>Somewhere you are — the verified network.</strong> Every clock-in records the IP.
          Punches from outside your shop&apos;s network are blocked, or flagged for you to review —
          so a clock-in &quot;from the parking lot&quot; on mobile data doesn&apos;t slip through.
        </li>
        <li>
          <strong>Something you tap — the NFC tag (beta).</strong> A coin-sized sticker by the
          espresso machine. A tap that has to happen within a few centimeters of a tag that lives
          only at your shop.
        </li>
      </ul>
      <p>
        Device (something you have) + network (somewhere you are) + tag (something you tap). To
        fake a punch you&apos;d need a co-worker&apos;s enrolled phone, physically on your
        shop&apos;s WiFi, tapping a tag that&apos;s bolted to your wall. At that point they&apos;re
        just... at work.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        Why not face recognition?
      </h2>
      <p>
        Face recognition was designed for 200-person factories, not four-person cafés. It verifies
        who&apos;s in front of the camera by storing a mathematical model of their face — biometric
        data that triggers laws like Illinois&apos; BIPA, which has produced settlements in the
        hundreds of millions. Your barista doesn&apos;t want their face in a vendor&apos;s
        database, and you don&apos;t want the legal exposure.
      </p>
      <p>
        DailyBrew collects <strong>zero</strong> biometric data. We verify the device, not the
        person&apos;s body.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        Why not GPS?
      </h2>
      <p>
        Geofencing tells you a phone is <em>near</em> the shop — not whose phone, and not whether
        they&apos;re actually inside. It also demands always-on location permission and drains
        batteries, which is why staff hate it. We skip GPS entirely. The network check answers
        &quot;are they on the shop&apos;s WiFi?&quot; far more precisely than a GPS bubble, with no
        battery cost and no location tracking.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        What about forgotten phones and broken screens?
      </h2>
      <p>Small teams need flexibility, so the system has honest escape hatches:</p>
      <ul className="space-y-3 list-disc pl-6">
        <li>
          Forgot your phone? Your manager clocks you in from the dashboard — logged as an override
          with their name, the time, and a reason.
        </li>
        <li>
          New phone? Your manager resets your device binding in two taps; the old phone is
          deauthorized automatically.
        </li>
        <li>
          No NFC on an older phone? The QR code is the universal fallback, and it runs through the
          same device and network checks.
        </li>
      </ul>
      <p>Every override is in the audit trail. Flexibility, without a PIN to share.</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        Start with what&apos;s shipped
      </h2>
      <p>
        QR + device + IP verification is live today and free for up to 10 active employees. NFC
        tap-to-clock-in is in beta — same verification stack, just a faster gesture.
      </p>
      <p>
        See the{' '}
        <Link to="/features" className="text-coffee no-underline hover:underline">
          verification features
        </Link>
        , check{' '}
        <Link to="/pricing" className="text-coffee no-underline hover:underline">
          pricing
        </Link>
        , or{' '}
        <Link to="/sign-up" className="text-coffee no-underline hover:underline">
          start free
        </Link>{' '}
        and have honest timesheets running before the morning rush.
      </p>
    </div>
  );
}
