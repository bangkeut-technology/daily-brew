import { Link } from '@tanstack/react-router';

/**
 * Companion post to the /stop-buddy-punching marketing page.
 * Cost-and-cure framing: 2.2% payroll number from Nucleus Research,
 * 75% prevalence from APA, then why face/GPS aren't the right fix for
 * small cafés, then the three-layer solution. Cross-links back to
 * three-factor-attendance for the deeper conceptual piece.
 *
 * Absolute-dollar examples use Cambodian café reality (~$1,000/mo payroll
 * for a 5-person shop) rather than US figures — DailyBrew's home market.
 * The 2.2% percentage stays universal so the framing scales to any region.
 */
export function TheBuddyPunchingTaxPost() {
  return (
    <div className="space-y-6 text-[16px] leading-relaxed text-text-secondary">
      <p>
        A 5-person café in Phnom Penh paying around $1,000 a month in wages loses roughly $22
        every month to buddy punching. That sounds small — until you realize it&apos;s the cost
        of a week of electricity, or two staff lunches. Over a year it&apos;s <strong>$264</strong>{' '}
        — your espresso grinder, gone to hours nobody actually worked.
      </p>
      <p>
        The 2.2% number comes from Nucleus Research; the American Payroll Association estimates
        roughly 75% of businesses are affected. On a small Cambodian team the{' '}
        <em>percentage</em> is the same as on a 200-person operation in the US, but the{' '}
        <em>visibility</em> is worse: one staff member covering for a chronically late friend
        over six months is the difference between a tight budget and a bad month — at a margin
        where a bad month gets you behind on rent.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        What buddy punching actually looks like
      </h2>
      <p>It&apos;s almost never theft for theft&apos;s sake. It&apos;s:</p>
      <ul className="space-y-3 list-disc pl-6">
        <li>The texted &quot;I clocked you in&quot; from the parking lot</li>
        <li>The PIN written on the back of the iPad by the register</li>
        <li>The &quot;we share a phone — Mia logs in for both of us&quot; arrangement</li>
        <li>The QR code photographed and shared in a group chat</li>
      </ul>
      <p>Each one is invisible in a normal time-clock report.</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        The two bad fixes
      </h2>
      <p>
        <strong>Face recognition</strong> was designed for 200-person factories. It collects
        biometric data — triggering laws like Illinois&apos; BIPA, which has produced settlements
        in the hundreds of millions — staff hate it, and a single bad scan in the morning rush is
        a 20-minute headache.
      </p>
      <p>
        <strong>GPS / geofencing</strong> demands always-on location permission and drains
        batteries. It tells you a phone is <em>near</em> the shop — not <em>whose</em> phone, and
        not whether it&apos;s actually inside.
      </p>
      <p>Neither matches the budget or the ethics of a small café.</p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        The actual fix: three small layers
      </h2>
      <ol className="space-y-3 list-decimal pl-6">
        <li>
          <strong>The phone is bound to the person.</strong> First clock-in registers the device;
          later punches from someone else&apos;s phone don&apos;t count.
        </li>
        <li>
          <strong>The clock-in is bound to your shop&apos;s network.</strong> Off-network punches
          are flagged or blocked. No GPS, no battery drain.
        </li>
        <li>
          <strong>The punch is bound to your shop&apos;s NFC tag (beta).</strong> A coin-sized
          sticker by the espresso machine. The tap has to happen there.
        </li>
      </ol>
      <p>
        To fake a punch you&apos;d need a co-worker&apos;s enrolled phone, on your shop&apos;s
        WiFi, tapping a tag bolted to your wall. At that point they&apos;re just... at work.
      </p>

      <h2 className="font-serif text-2xl font-semibold text-text-primary mt-10 mb-2">
        What to do today
      </h2>
      <p>
        Read the{' '}
        <Link
          to="/blog/$slug"
          params={{ slug: 'three-factor-attendance' }}
          className="text-coffee no-underline hover:underline"
        >
          three-factor explainer
        </Link>{' '}
        for the deeper conceptual story, see the{' '}
        <Link to="/stop-buddy-punching" className="text-coffee no-underline hover:underline">
          stop buddy punching
        </Link>{' '}
        walk-through, or{' '}
        <Link to="/sign-up" className="text-coffee no-underline hover:underline">
          start free
        </Link>{' '}
        — up to 10 active employees, no credit card, no hardware.
      </p>
    </div>
  );
}
