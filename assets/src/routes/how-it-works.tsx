import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  UserPlus,
  QrCode,
  BarChart3,
  ChevronRight,
  Building2,
  Clock,
  CalendarOff,
  CalendarDays,
  Shield,
  Bell,
  Smartphone,
  CheckCircle,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/how-it-works')({
  component: HowItWorksPage,
});

const steps = [
  {
    number: '01',
    icon: <Building2 size={28} strokeWidth={1.6} />,
    title: 'Create your workspace',
    desc: 'Sign up and name your restaurant. DailyBrew generates a unique QR code for your workspace automatically — print it and display it at your entrance.',
    details: [
      'One workspace per restaurant location',
      'QR code generated instantly',
      'Invite your team in minutes',
    ],
    accent: '#6B4226',
  },
  {
    number: '02',
    icon: <UserPlus size={28} strokeWidth={1.6} />,
    title: 'Add your employees',
    desc: 'Create employee profiles with names and phone numbers. Assign each person to a shift so DailyBrew knows when to expect them.',
    details: [
      'Assign morning, evening, or custom shifts',
      'Set shift start and end times',
      'Optionally link employees to user accounts',
    ],
    accent: '#4A7C59',
  },
  {
    number: '03',
    icon: <QrCode size={28} strokeWidth={1.6} />,
    title: 'Staff scan to check in',
    desc: 'Employees open the DailyBrew app on their phone, scan the workspace QR code, and they are checked in. Same scan to check out at the end of their shift.',
    details: [
      'Works on any smartphone',
      'One tap to check in, one tap to check out',
      'Optional IP, device, and geofence verification',
    ],
    accent: '#C17F3B',
  },
  {
    number: '04',
    icon: <BarChart3 size={28} strokeWidth={1.6} />,
    title: 'Track everything live',
    desc: 'Your dashboard shows who is present, who is late, who is on leave, and who has not shown up — all in real time. Late arrivals and early departures are flagged automatically.',
    details: [
      'Real-time attendance overview',
      'Late and early departure detection',
      'Daily attendance summary notifications',
    ],
    accent: '#3B6FA0',
  },
];

const ownerFeatures = [
  { icon: <BarChart3 size={18} />, label: 'Live dashboard with attendance stats' },
  { icon: <UserPlus size={18} />, label: 'Add and manage employees' },
  { icon: <Clock size={18} />, label: 'Define shifts and schedules' },
  { icon: <CalendarOff size={18} />, label: 'Schedule closures and holidays' },
  { icon: <CalendarDays size={18} />, label: 'Approve or reject leave requests' },
  { icon: <Shield size={18} />, label: 'Configure IP, device, and geofence rules' },
  { icon: <Bell size={18} />, label: 'Daily summary via push and email' },
];

const employeeFeatures = [
  { icon: <QrCode size={18} />, label: 'Scan QR to check in and out' },
  { icon: <Smartphone size={18} />, label: 'Personal dashboard on mobile' },
  { icon: <Clock size={18} />, label: 'View own shift and attendance history' },
  { icon: <CalendarDays size={18} />, label: 'Submit leave requests' },
  { icon: <Bell size={18} />, label: 'Get notified of shift changes and closures' },
  { icon: <CheckCircle size={18} />, label: 'See approval status in real time' },
];

function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <PageSeo
        title="How it works"
        description="Set up staff attendance tracking in minutes. Create a workspace, add employees, display a QR code, and track check-ins live from your dashboard."
        path="/how-it-works"
      />
      <LandingNav />

      <div className="pt-28 pb-20 px-6 md:px-8 max-w-5xl mx-auto page-enter">
        {/* Hero */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
            How it works
          </p>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight">
            Up and running in minutes
          </h1>
          <p className="text-[17px] text-text-secondary mt-4 max-w-xl mx-auto">
            Four simple steps from sign-up to live attendance tracking.
            No hardware, no complex setup.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 mb-24">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="group relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {/* Accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ background: step.accent }}
              />

              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Step number + icon */}
                <div className="flex items-center gap-4 md:flex-col md:items-center md:min-w-[80px]">
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: `${step.accent}12`, color: step.accent }}
                    >
                      {step.icon}
                    </div>
                    <span
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
                      style={{ background: step.accent }}
                    >
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-[20px] font-semibold text-text-primary font-serif mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[15px] text-text-secondary leading-relaxed mb-4">
                    {step.desc}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2.5">
                        <CheckCircle
                          size={14}
                          className="flex-shrink-0"
                          style={{ color: step.accent }}
                        />
                        <span className="text-[14px] text-text-secondary">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Owner vs Employee perspectives */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
            Two perspectives
          </p>
          <h2 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
            Built for owners and employees
          </h2>
          <p className="text-[16px] text-text-secondary mt-3 max-w-lg mx-auto">
            Restaurant owners get a management dashboard. Employees get a simple
            mobile experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {/* Owner card */}
          <motion.div
            className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-coffee/10 flex items-center justify-center">
                <Building2 size={20} className="text-coffee" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-text-primary">
                  For owners
                </h3>
                <p className="text-[13px] text-text-tertiary">
                  Full control from your dashboard
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {ownerFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-coffee/8 flex items-center justify-center text-coffee flex-shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-[14.5px] text-text-secondary">
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Employee card */}
          <motion.div
            className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center">
                <Smartphone size={20} className="text-green" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-text-primary">
                  For employees
                </h3>
                <p className="text-[13px] text-text-tertiary">
                  Simple mobile experience
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {employeeFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green/8 flex items-center justify-center text-green flex-shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-[14.5px] text-text-secondary">
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[24px] font-semibold text-text-primary font-serif mb-3">
            Ready to simplify attendance?
          </h3>
          <p className="text-[16px] text-text-secondary mb-6">
            Free for up to 10 employees. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/sign-up"
              className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
            >
              Get started free
              <ChevronRight size={14} />
            </Link>
            <Link
              to="/features"
              className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
            >
              View all features
            </Link>
          </div>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}
