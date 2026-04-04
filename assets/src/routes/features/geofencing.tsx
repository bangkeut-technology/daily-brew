import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  MapPin, Shield, CheckCircle, ChevronRight, Crown,
  Settings, ToggleRight, Save, AlertTriangle, Locate,
  CircleDot, Smartphone, ArrowLeft, HelpCircle, Ruler,
  Navigation, Layers,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/features/geofencing')({
  component: GeofencingPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.5 },
};

const stagger = (i: number) => ({
  ...fadeUp,
  transition: { duration: 0.4, delay: i * 0.08 },
});

function GeofencingPage() {
  return (
    <div className="min-h-screen">
      <PageSeo
        title="Geofencing"
        description="Draw a GPS perimeter around your restaurant. Staff must be physically within range to check in. Configurable radius from 50m to 5,000m."
        path="/features/geofencing"
      />
      <LandingNav />

      <div className="pt-28 pb-20 px-6 md:px-8 max-w-4xl mx-auto page-enter">
        {/* Back link */}
        <motion.div className="mb-10" {...fadeUp}>
          <Link
            to="/features"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-tertiary hover:text-coffee no-underline transition-colors"
          >
            <ArrowLeft size={14} />
            All features
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div className="mb-16" {...fadeUp}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#7C5C9B]/10 flex items-center justify-center">
              <MapPin size={28} className="text-[#7C5C9B]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
                Espresso
              </span>
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#7C5C9B]/8 text-[#7C5C9B] uppercase tracking-wider">
                Location
              </span>
            </div>
          </div>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight mb-4">
            Geofencing
          </h1>
          <p className="text-[18px] md:text-[20px] text-text-secondary leading-relaxed max-w-2xl">
            Draw a virtual boundary around your restaurant. When employees try to check in,
            DailyBrew verifies their GPS location — if they're outside the radius, the check-in
            is blocked.
          </p>
        </motion.div>

        {/* The problem it solves */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            The problem
          </h2>
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center flex-shrink-0 mt-1">
                <AlertTriangle size={20} className="text-red" />
              </div>
              <div className="space-y-3">
                <p className="text-[16px] text-text-primary font-medium">
                  IP restriction depends on network — but not every restaurant has a reliable, static WiFi setup.
                </p>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  Some restaurants share a building's WiFi. Some use mobile hotspots that change IPs.
                  And some staff use mobile data instead of WiFi. In these situations, IP restriction
                  alone isn't enough to verify someone is actually on-site.
                </p>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  Geofencing solves this by using the one thing that can't be faked easily: the
                  employee's physical GPS location.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            How it works
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: <Locate size={20} />,
                title: 'You set a center point',
                desc: 'In your workspace settings, you define the GPS coordinates of your restaurant. The easiest way: click "Use my current location" while standing in the restaurant, and DailyBrew will auto-detect your latitude and longitude. You can also enter coordinates manually if you prefer.',
              },
              {
                icon: <CircleDot size={20} />,
                title: 'You choose a radius',
                desc: 'Set how far from the center point employees are allowed to be — in meters. The default is 100m, which works for most restaurants. A small cafe might use 50m (the minimum). A large venue or outdoor seating area might need 200–500m. Maximum is 5,000m.',
              },
              {
                icon: <Navigation size={20} />,
                title: 'Employee\'s phone shares its location',
                desc: 'When an employee taps "Check in", their browser asks for location permission (a standard browser prompt). The GPS coordinates are sent with the check-in request. This happens once per check-in — DailyBrew does not track location continuously.',
              },
              {
                icon: <Shield size={20} />,
                title: 'DailyBrew compares distance',
                desc: 'The server calculates the distance between the employee\'s GPS position and your restaurant\'s center point. If they\'re within the radius — check-in succeeds. If they\'re outside — the check-in is blocked with a clear error message.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#7C5C9B]/10 flex items-center justify-center text-[#7C5C9B] flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-[15px] text-text-secondary leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: <MapPin size={20} />,
                title: 'Verify physical presence',
                desc: 'The most direct proof that an employee is at the restaurant. GPS doesn\'t depend on which WiFi network they\'re on — it confirms their actual location.',
              },
              {
                icon: <Ruler size={20} />,
                title: 'Flexible radius',
                desc: 'From 50m for a small cafe to 5,000m for a large property. Adjust the boundary to match your actual venue size, including outdoor areas and parking.',
              },
              {
                icon: <Layers size={20} />,
                title: 'Layer with other security',
                desc: 'Use geofencing alone or combine it with IP restriction and device verification. When all three are active, an employee must be on the right network, using their own device, and physically at the restaurant.',
              },
              {
                icon: <CheckCircle size={20} />,
                title: 'One-time location prompt',
                desc: 'The browser only asks for location permission once. After that, check-ins are seamless. DailyBrew never tracks employees between check-ins — location is read once, verified, and not stored.',
              },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C5C9B]/10 flex items-center justify-center text-[#7C5C9B] mb-4">
                  {b.icon}
                </div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">{b.title}</h3>
                <p className="text-[14.5px] text-text-secondary leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Radius guide */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            Choosing the right radius
          </h2>
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <p className="text-[15px] text-text-secondary leading-relaxed mb-6">
              GPS accuracy varies by device, weather, and building density. Indoors, GPS can drift
              5–20 meters. Choose a radius that covers your venue with a comfortable margin:
            </p>
            <div className="space-y-4">
              {[
                { range: '50–100m', venue: 'Small cafe or kiosk', note: 'Tight boundary. Works well for small, single-floor locations with good GPS signal.' },
                { range: '100–200m', venue: 'Standard restaurant', note: 'Recommended for most restaurants. Covers indoor areas, kitchen, storage rooms, and a small patio.' },
                { range: '200–500m', venue: 'Large venue or outdoor area', note: 'For restaurants with large outdoor seating, rooftop areas, or spread across a compound.' },
                { range: '500–5,000m', venue: 'Campus, resort, or compound', note: 'For properties with multiple buildings, large grounds, or locations where staff work across a wide area.' },
              ].map((r, i) => (
                <motion.div
                  key={r.range}
                  className="flex items-start gap-4 p-4 rounded-xl bg-cream/40 dark:bg-cream/5"
                  {...stagger(i)}
                >
                  <span className="text-[14px] font-bold font-mono text-[#7C5C9B] bg-[#7C5C9B]/10 px-3 py-1.5 rounded-lg flex-shrink-0 min-w-[90px] text-center">
                    {r.range}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-text-primary mb-0.5">{r.venue}</p>
                    <p className="text-[14px] text-text-secondary leading-relaxed">{r.note}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Setup guide */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-2">
            How to set it up
          </h2>
          <p className="text-[15px] text-text-secondary mb-8">
            Best done while you're at the restaurant, so the auto-detect picks up the right coordinates.
          </p>

          <div className="space-y-6">
            {[
              {
                step: '1',
                icon: <Settings size={20} />,
                title: 'Go to workspace settings',
                desc: 'Open your dashboard and click "Settings" in the sidebar. Scroll down to the "Geofencing" section.',
              },
              {
                step: '2',
                icon: <ToggleRight size={20} />,
                title: 'Enable geofencing',
                desc: 'Toggle on "Enable geofencing for check-in". If you\'re on the free plan, you\'ll be prompted to upgrade to Espresso first.',
              },
              {
                step: '3',
                icon: <Locate size={20} />,
                title: 'Set your restaurant\'s location',
                desc: 'Click "Use my current location". Your browser will ask for permission to access your location — tap Allow. DailyBrew reads your GPS coordinates and fills in the latitude and longitude fields automatically. You can also enter coordinates manually if you already know them.',
              },
              {
                step: '4',
                icon: <CircleDot size={20} />,
                title: 'Set the radius',
                desc: 'Enter the radius in meters. Default is 100m. The minimum is 50m (GPS isn\'t accurate enough below this). For most restaurants, 100–200m works well. If you have outdoor seating or a large property, go wider.',
              },
              {
                step: '5',
                icon: <Save size={20} />,
                title: 'Save and verify',
                desc: 'Hit save. You\'ll see a confirmation showing your coordinates and the active radius. Try a test check-in from the restaurant to make sure it works. Then try from across the street to verify it blocks — you\'ll see the boundary in action.',
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                className="flex items-start gap-5"
                {...stagger(i)}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-coffee flex items-center justify-center text-[16px] font-bold text-white flex-shrink-0">
                    {s.step}
                  </span>
                  {i < 4 && <div className="w-px h-8 bg-cream-3" />}
                </div>
                <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 flex-1 shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-coffee/10 flex items-center justify-center text-coffee">
                      {s.icon}
                    </div>
                    <h3 className="text-[16px] font-semibold text-text-primary">{s.title}</h3>
                  </div>
                  <p className="text-[15px] text-text-secondary leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            Common questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Does DailyBrew track my employees\' location all day?',
                a: 'No. DailyBrew reads the GPS location once — at the moment of check-in (and again at check-out). The coordinates are used only to verify distance from the restaurant. DailyBrew does not store employee GPS data, does not track movement, and does not run in the background.',
              },
              {
                q: 'What if the employee denies the location permission?',
                a: 'If the employee blocks location access in their browser, the check-in request won\'t include GPS data and the geofence check will fail. They\'ll see a message asking them to allow location access. This is a standard browser permission — not a DailyBrew-specific app.',
              },
              {
                q: 'How accurate is GPS indoors?',
                a: 'Indoors, GPS accuracy can degrade to 10–20 meters depending on the building. That\'s why the minimum radius is 50m — anything smaller would cause too many false rejections. If your restaurant is in a building with weak GPS signal (basement, thick walls), consider using a slightly larger radius like 150–200m.',
              },
              {
                q: 'What if my restaurant moves or I remodel?',
                a: 'Just update the coordinates in settings. Click "Use my current location" from the new spot and save. The change takes effect immediately for all future check-ins.',
              },
              {
                q: 'Can employees fake their GPS location?',
                a: 'It\'s technically possible to spoof GPS on a rooted/jailbroken phone or with developer tools. However, this requires deliberate effort and technical knowledge. For the vast majority of restaurant staff, geofencing is an effective deterrent. For maximum security, combine geofencing with IP restriction and device verification.',
              },
              {
                q: 'Does this work on both iOS and Android?',
                a: 'Yes. Geofencing uses the standard browser Geolocation API, which is supported on all modern iPhones and Android phones. The browser handles the GPS reading — DailyBrew just receives the coordinates.',
              },
            ].map((faq, i) => (
              <motion.div
                key={faq.q}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="flex items-start gap-3">
                  <HelpCircle size={18} className="text-amber mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-[15px] font-semibold text-text-primary mb-2">{faq.q}</h3>
                    <p className="text-[14.5px] text-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tip */}
        <motion.div
          className="mb-16 bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
          {...fadeUp}
        >
          <h3 className="text-[17px] font-semibold text-text-primary mb-4">
            Best practice: layer all three
          </h3>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-5">
            Each security feature covers a different angle. Together, they make check-in fraud
            nearly impossible:
          </p>
          <div className="space-y-3">
            {[
              { icon: <Shield size={15} />, color: 'text-red', label: 'IP restriction', desc: 'Verifies the network — are they on restaurant WiFi?' },
              { icon: <Smartphone size={15} />, color: 'text-coffee', label: 'Device verification', desc: 'Verifies the device — is this their own phone?' },
              { icon: <MapPin size={15} />, color: 'text-[#7C5C9B]', label: 'Geofencing', desc: 'Verifies the location — are they physically here?' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cream/40 dark:bg-cream/5">
                <span className={`${f.color} flex-shrink-0`}>{f.icon}</span>
                <span className="text-[14.5px] font-medium text-text-primary">{f.label}</span>
                <span className="text-[14px] text-text-tertiary">—</span>
                <span className="text-[14px] text-text-secondary">{f.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Espresso callout */}
        <motion.div
          className="mb-16 flex items-start gap-4 px-6 py-5 rounded-2xl bg-amber/8 border border-amber/15"
          {...fadeUp}
        >
          <Crown size={20} className="text-amber flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[15px] font-semibold text-text-primary mb-1">
              Available on the Espresso plan
            </p>
            <p className="text-[14.5px] text-text-secondary leading-relaxed">
              Geofencing is included in the Espresso plan ($14.99/month or $149/year) alongside
              IP restriction, device verification, leave management, manager roles, and more.
            </p>
          </div>
        </motion.div>

        {/* Related features */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[20px] font-semibold text-text-primary font-serif mb-6">
            Related security features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/features/ip-restriction"
              className="group bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 shadow-[0_2px_12px_rgba(107,66,38,0.05)] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-red/10 flex items-center justify-center">
                  <Shield size={18} className="text-red" />
                </div>
                <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-coffee transition-colors">
                  IP restriction
                </h3>
                <ChevronRight size={14} className="text-text-tertiary ml-auto" />
              </div>
              <p className="text-[14px] text-text-secondary">
                Lock check-ins to your restaurant's WiFi. Prevent remote punching.
              </p>
            </Link>
            <Link
              to="/features/device-verification"
              className="group bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 shadow-[0_2px_12px_rgba(107,66,38,0.05)] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-coffee/10 flex items-center justify-center">
                  <Smartphone size={18} className="text-coffee" />
                </div>
                <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-coffee transition-colors">
                  Device verification
                </h3>
                <ChevronRight size={14} className="text-text-tertiary ml-auto" />
              </div>
              <p className="text-[14px] text-text-secondary">
                Bind check-in/out to one device per employee per day. Prevents buddy punching.
              </p>
            </Link>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div className="text-center" {...fadeUp}>
          <h3 className="text-[24px] font-semibold text-text-primary font-serif mb-3">
            Ready to set your boundary?
          </h3>
          <p className="text-[16px] text-text-secondary mb-6">
            Start free, upgrade to Espresso when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/sign-up"
              className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
            >
              Start free
              <ChevronRight size={14} />
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
            >
              Compare plans
            </Link>
          </div>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}
