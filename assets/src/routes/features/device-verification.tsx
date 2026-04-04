import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Smartphone, Shield, CheckCircle, ChevronRight, Crown,
  Settings, ToggleRight, Save, AlertTriangle, Fingerprint,
  UserX, ArrowLeft, MapPin, HelpCircle, Users, ClipboardList,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/features/device-verification')({
  component: DeviceVerificationPage,
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

function DeviceVerificationPage() {
  return (
    <div className="min-h-screen">
      <PageSeo
        title="Device Verification"
        description="Prevent buddy punching by binding check-in and check-out to a single device per employee per day. Full audit trail included."
        path="/features/device-verification"
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
            <div className="w-14 h-14 rounded-2xl bg-coffee/10 flex items-center justify-center">
              <Smartphone size={28} className="text-coffee" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
                Espresso
              </span>
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-coffee/8 text-coffee uppercase tracking-wider">
                Anti-fraud
              </span>
            </div>
          </div>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight mb-4">
            Device verification
          </h1>
          <p className="text-[18px] md:text-[20px] text-text-secondary leading-relaxed max-w-2xl">
            Each employee must check in and check out from the same device on the same day.
            No more colleagues clocking out for each other — the system knows which phone
            checked in.
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
                  "Buddy punching" is one of the most common attendance fraud issues in restaurants.
                </p>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  Employee A leaves early but asks Employee B to check them out at the end of the shift.
                  Or one person uses multiple phones to check in for absent colleagues. Without device
                  verification, there's no way to tell who is actually scanning the QR code — you just
                  see a check-in time, not which device was used.
                </p>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  In a busy restaurant, owners can't watch the door all day. Device verification
                  does that job automatically.
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
                icon: <Fingerprint size={20} />,
                title: 'Every device gets a unique ID',
                desc: 'When an employee opens DailyBrew on their phone for the first time, the app generates a unique device ID and stores it locally. This ID is invisible to the employee — it works silently in the background, no setup required on their end.',
              },
              {
                icon: <Smartphone size={20} />,
                title: 'Check-in locks to that device',
                desc: 'When an employee checks in, DailyBrew records which device was used. The device ID and device name (parsed from the browser user agent) are stored on the attendance record. This is the device they must use to check out later.',
              },
              {
                icon: <UserX size={20} />,
                title: 'One device per employee, one employee per device',
                desc: 'If a second employee tries to check in using the same phone that someone else already used today, the system blocks it. And if an employee tries to check out from a different device than the one they checked in with, that\'s blocked too.',
              },
              {
                icon: <ClipboardList size={20} />,
                title: 'Full audit trail on every record',
                desc: 'Each attendance record stores both the check-in and check-out device IDs along with the parsed device names (e.g., "iPhone 15 Pro, Safari 17"). Owners can see exactly which device was used for each clock event.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-coffee/10 flex items-center justify-center text-coffee flex-shrink-0">
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
                icon: <UserX size={20} />,
                title: 'Eliminate buddy punching',
                desc: 'A colleague can\'t check out for someone who already left. The check-out must come from the same device that checked in — no exceptions.',
              },
              {
                icon: <Users size={20} />,
                title: 'One phone, one person',
                desc: 'A single phone can\'t be used to check in multiple employees on the same day. Each device is bound to one employee per day.',
              },
              {
                icon: <ClipboardList size={20} />,
                title: 'Transparent audit trail',
                desc: 'Every attendance record shows the device ID and name for both check-in and check-out. If there\'s ever a dispute, you have the data.',
              },
              {
                icon: <CheckCircle size={20} />,
                title: 'Zero friction for employees',
                desc: 'No apps to install, no codes to enter, no fingerprints to scan. The device ID is generated automatically in the browser. Employees don\'t even know it\'s there.',
              },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="w-10 h-10 rounded-xl bg-coffee/10 flex items-center justify-center text-coffee mb-4">
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
            The simplest security feature to enable — just one toggle. No configuration needed on employee devices.
          </p>

          <div className="space-y-6">
            {[
              {
                step: '1',
                icon: <Settings size={20} />,
                title: 'Go to workspace settings',
                desc: 'Open your dashboard and click "Settings" in the sidebar. You\'ll see a "Device verification" section.',
              },
              {
                step: '2',
                icon: <ToggleRight size={20} />,
                title: 'Enable device verification',
                desc: 'Toggle on "Enable device verification". If you\'re on the free plan, you\'ll be prompted to upgrade to Espresso first.',
              },
              {
                step: '3',
                icon: <Save size={20} />,
                title: 'Save — that\'s it',
                desc: 'Hit save. The system immediately starts enforcing device binding. The next time any employee checks in, their device ID is recorded and locked for the day. No action needed from your staff.',
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
                  {i < 2 && <div className="w-px h-8 bg-cream-3" />}
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

        {/* What employees see */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            What your employees experience
          </h2>
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <CheckCircle size={16} className="text-green mt-0.5 flex-shrink-0" />
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  <span className="font-medium text-text-primary">Normal check-in:</span>{' '}
                  nothing changes. They scan the QR code on their own phone and it works exactly
                  as before. The device binding happens invisibly.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber mt-0.5 flex-shrink-0" />
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  <span className="font-medium text-text-primary">Wrong device on check-out:</span>{' '}
                  if they try to check out from a different phone, they see a clear message:
                  "You must use the same device you checked in with." No cryptic errors.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber mt-0.5 flex-shrink-0" />
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  <span className="font-medium text-text-primary">Device already used:</span>{' '}
                  if Employee B tries to check in on Employee A's phone (which A already used today),
                  the system blocks it with a message explaining the device has already been used by
                  another employee.
                </p>
              </div>
            </div>
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
                q: 'What if an employee gets a new phone?',
                a: 'Device binding is per day. When they check in on a new phone the next day, it becomes their device for that day. There\'s no long-term device registration — each day is a fresh start.',
              },
              {
                q: 'What if an employee clears their browser data?',
                a: 'Clearing browser data removes the stored device ID. A new ID will be generated next time they open the app. This means check-out could be blocked that day if the ID doesn\'t match the one from check-in. In practice, employees rarely clear browser data mid-shift.',
              },
              {
                q: 'Does this work on shared or kiosk devices?',
                a: 'Device verification is designed for employees using their own phones. If multiple people share one device (e.g., a tablet at the entrance), only the first person who checks in can use it that day. For shared devices, you may want to disable this feature and use IP restriction or geofencing instead.',
              },
              {
                q: 'Can I see which device an employee used?',
                a: 'Yes. Each attendance record includes the device name (parsed from the browser user agent) for both check-in and check-out. You can see entries like "iPhone 15 Pro, Safari 17" or "Samsung Galaxy S24, Chrome 126" in the attendance detail.',
              },
              {
                q: 'Does this require employees to install an app?',
                a: 'No. Device verification works entirely through the web browser. The device ID is a UUID stored in localStorage — it\'s generated automatically the first time an employee opens DailyBrew. No app install, no permissions, no setup.',
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
              Device verification is included in the Espresso plan ($14.99/month or $149/year).
              Combine it with IP restriction and geofencing for complete check-in security.
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
            Stop buddy punching today
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
