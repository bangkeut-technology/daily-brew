import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Shield, Wifi, Ban, CheckCircle, ChevronRight, Crown,
  Settings, ToggleRight, Plus, Save, AlertTriangle, Globe,
  ArrowLeft, Smartphone, MapPin, HelpCircle, Server,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/features/ip-restriction')({
  component: IpRestrictionPage,
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

function IpRestrictionPage() {
  return (
    <div className="min-h-screen">
      <PageSeo
        title="IP Restriction"
        description="Lock staff check-ins to your restaurant's WiFi or network. Prevent remote punching and ensure employees are on-site when they clock in."
        path="/features/ip-restriction"
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
            <div className="w-14 h-14 rounded-2xl bg-red/10 flex items-center justify-center">
              <Shield size={28} className="text-red" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
                Espresso
              </span>
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-red/8 text-red uppercase tracking-wider">
                Security
              </span>
            </div>
          </div>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight mb-4">
            IP restriction
          </h1>
          <p className="text-[18px] md:text-[20px] text-text-secondary leading-relaxed max-w-2xl">
            Make sure your staff are physically at the restaurant when they check in.
            IP restriction locks attendance to your restaurant's network — if they're not
            on your WiFi, they can't clock in.
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
              <div>
                <p className="text-[16px] text-text-primary font-medium mb-3">
                  Without IP restriction, any employee with the QR code data can check in from anywhere.
                </p>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  They could be at home, on the bus, or at another location entirely. If someone
                  shares the QR payload with a colleague, that person can check in without ever
                  stepping foot in the restaurant. You'd never know unless you were watching
                  the door yourself.
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
                icon: <Wifi size={20} />,
                title: 'Your network has a public IP address',
                desc: 'Every internet connection has a public IP address assigned by your ISP. When your staff are connected to your restaurant\'s WiFi, all their traffic goes through that IP. DailyBrew sees this IP on every check-in request.',
              },
              {
                icon: <Shield size={20} />,
                title: 'You tell DailyBrew which IPs to trust',
                desc: 'In your workspace settings, you add one or more IP addresses. These are the only networks your staff are allowed to check in from. Any check-in attempt from a different IP is blocked with a clear error message.',
              },
              {
                icon: <CheckCircle size={20} />,
                title: 'Staff check in as normal — the validation is invisible',
                desc: 'Your employees don\'t need to do anything differently. They scan the QR code the same way they always do. If they\'re on the right network, it works. If not, they see a message explaining that check-in is restricted to the restaurant network.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center text-red flex-shrink-0">
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
                icon: <Ban size={20} />,
                title: 'Prevent remote check-ins',
                desc: 'Employees can\'t check in from home, the parking lot, or anywhere outside your restaurant. They must be connected to an approved network.',
              },
              {
                icon: <Server size={20} />,
                title: 'Support multiple networks',
                desc: 'Have a main WiFi and a backup connection? Add both IPs. You can list as many allowed IPs as you need — WiFi, ethernet, mobile hotspot.',
              },
              {
                icon: <Shield size={20} />,
                title: 'Fail-safe by design',
                desc: 'If you enable IP restriction but forget to add any IPs, DailyBrew allows all check-ins instead of locking everyone out. No accidental lockouts.',
              },
              {
                icon: <Globe size={20} />,
                title: 'Works with any network setup',
                desc: 'Static IP, dynamic IP, VPN — if the request arrives from an IP on your list, it\'s accepted. Works with any ISP or network configuration.',
              },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center text-red mb-4">
                  {b.icon}
                </div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">{b.title}</h3>
                <p className="text-[14.5px] text-text-secondary leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Setup guide */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-2">
            How to set it up
          </h2>
          <p className="text-[15px] text-text-secondary mb-8">
            Takes less than a minute. You just need to be at the restaurant, connected to the WiFi you want to lock check-ins to.
          </p>

          <div className="space-y-6">
            {[
              {
                step: '1',
                icon: <Settings size={20} />,
                title: 'Go to workspace settings',
                desc: 'Open your dashboard, click "Settings" in the sidebar. Scroll to the "Workspace settings" section.',
              },
              {
                step: '2',
                icon: <ToggleRight size={20} />,
                title: 'Enable IP restriction',
                desc: 'Toggle on "Enable IP restriction". If you\'re on the free plan, you\'ll be prompted to upgrade to Espresso first.',
              },
              {
                step: '3',
                icon: <Plus size={20} />,
                title: 'Add your restaurant\'s IP',
                desc: 'Click the "Use my current IP" button. DailyBrew will detect your public IP address as seen by the server and add it to the list automatically. You can also type IPs manually — one per line — if you have additional networks.',
              },
              {
                step: '4',
                icon: <Save size={20} />,
                title: 'Save your settings',
                desc: 'Hit "Save". From this moment, every check-in request is validated against your IP list. Employees on a different network will see a clear message telling them check-in is restricted.',
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
                  {i < 3 && <div className="w-px h-8 bg-cream-3" />}
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
                q: 'What if my restaurant\'s IP address changes?',
                a: 'Some ISPs assign dynamic IPs that can change periodically. If that happens, your staff will be blocked until you update the IP. Just go to Settings, click "Use my current IP" again, and save. If your IP changes frequently, consider asking your ISP for a static IP or using geofencing as an alternative.',
              },
              {
                q: 'Can I allow multiple IP addresses?',
                a: 'Yes. You can add as many IPs as you need — one per line. This is useful if you have multiple network connections (main WiFi, backup ethernet, manager hotspot) or multiple restaurant locations under one workspace.',
              },
              {
                q: 'What does the employee see when they\'re blocked?',
                a: 'They see a warm amber warning message explaining that check-in is restricted to the restaurant network. No cryptic error codes — just a clear explanation that they need to be on the right WiFi.',
              },
              {
                q: 'Can I use IP restriction together with geofencing and device verification?',
                a: 'Absolutely. All three security features work independently and can be combined for layered protection. An employee would need to pass all enabled checks to successfully check in.',
              },
              {
                q: 'What happens if I enable IP restriction but don\'t add any IPs?',
                a: 'DailyBrew treats an empty IP list as a misconfiguration and allows all check-ins. This is a safety net — you won\'t accidentally lock out your entire team.',
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
              IP restriction is included in the Espresso plan ($14.99/month or $149/year). It also
              includes device verification, geofencing, leave management, manager roles, and more.
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
            <Link
              to="/features/geofencing"
              className="group bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 shadow-[0_2px_12px_rgba(107,66,38,0.05)] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#7C5C9B]/10 flex items-center justify-center">
                  <MapPin size={18} className="text-[#7C5C9B]" />
                </div>
                <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-coffee transition-colors">
                  Geofencing
                </h3>
                <ChevronRight size={14} className="text-text-tertiary ml-auto" />
              </div>
              <p className="text-[14px] text-text-secondary">
                Restrict check-ins to a GPS radius around your restaurant.
              </p>
            </Link>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div className="text-center" {...fadeUp}>
          <h3 className="text-[24px] font-semibold text-text-primary font-serif mb-3">
            Ready to secure your check-ins?
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
