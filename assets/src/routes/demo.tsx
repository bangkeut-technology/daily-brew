import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  UserCircle,
  Copy,
  Check,
  ExternalLink,
  Coffee,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/demo')({
  component: DemoPage,
});

const accounts = [
  {
    role: 'Owner',
    email: 'reviewer@dailybrew.work',
    icon: <Building2 size={22} strokeWidth={1.6} />,
    color: '#6B4226',
    name: 'John Doe',
    desc: 'Full access to everything — dashboard, employees, shifts, closures, settings, billing, and leave approvals.',
    highlights: [
      'View the full attendance dashboard',
      'Add and manage employees',
      'Configure shifts, closures, and settings',
      'Approve or reject leave requests',
      'Promote employees to managers',
    ],
  },
  {
    role: 'Manager',
    email: 'manager@dailybrew.work',
    icon: <ShieldCheck size={22} strokeWidth={1.6} />,
    color: '#C17F3B',
    name: 'Sophea Chan',
    desc: 'A trusted employee with elevated permissions — can oversee attendance and handle leave requests.',
    highlights: [
      'View the full attendance dashboard',
      'Approve or reject leave requests',
      'See all employees\' attendance',
      'Check in and out like a regular employee',
      'No access to settings or employee management',
    ],
  },
  {
    role: 'Employee',
    email: 'employee@dailybrew.work',
    icon: <UserCircle size={22} strokeWidth={1.6} />,
    color: '#3B6FA0',
    name: 'Dara Sok',
    desc: 'A staff member — can check in, view their own attendance, and submit leave requests.',
    highlights: [
      'Personal dashboard with own attendance',
      'View own shift and check-in history',
      'Submit leave requests (full or partial day)',
      'Cancel own pending leave requests',
      'Check in and out via QR code',
    ],
  },
];

const PASSWORD = 'DailyBrew2026!';

function DemoPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen">
      <PageSeo
        title="Try the demo"
        description="Experience DailyBrew with a pre-configured demo workspace. Sign in as an owner, manager, or employee to explore all features."
        path="/demo"
      />
      <LandingNav />

      <div className="pt-28 pb-20 px-6 md:px-8 max-w-4xl mx-auto page-enter">
        {/* Hero */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber/8 border border-amber/15 mb-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Coffee size={14} className="text-amber" />
            <span className="text-[13px] font-medium text-amber">
              Espresso plan demo
            </span>
          </motion.div>

          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight">
            Try DailyBrew
          </h1>
          <p className="text-[17px] text-text-secondary mt-4 max-w-lg mx-auto">
            Sign in with any of the three demo accounts below to explore
            DailyBrew from different perspectives.
          </p>
        </motion.div>

        {/* Password card */}
        <motion.div
          className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 mb-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] uppercase tracking-[1px] font-medium text-text-tertiary mb-1">
                Password for all accounts
              </p>
              <code className="text-[16px] font-mono font-medium text-text-primary">
                {PASSWORD}
              </code>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(PASSWORD, 'password')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13.5px] font-medium bg-cream-3/50 text-text-secondary border-none cursor-pointer transition-all hover:bg-cream-3"
            >
              {copiedField === 'password' ? (
                <Check size={14} className="text-green" />
              ) : (
                <Copy size={14} />
              )}
              {copiedField === 'password' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </motion.div>

        {/* Account cards */}
        <div className="space-y-5 mb-14">
          {accounts.map((account, i) => (
            <motion.div
              key={account.role}
              className="group relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ background: account.color }}
              />

              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  {/* Left: role info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${account.color}12`, color: account.color }}
                      >
                        {account.icon}
                      </div>
                      <div>
                        <h3 className="text-[17px] font-semibold text-text-primary">
                          {account.role}
                        </h3>
                        <p className="text-[13.5px] text-text-tertiary">
                          {account.name}
                        </p>
                      </div>
                    </div>

                    <p className="text-[14.5px] text-text-secondary leading-relaxed mb-4">
                      {account.desc}
                    </p>

                    <ul className="space-y-1.5">
                      {account.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <Check
                            size={13}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: account.color }}
                            strokeWidth={2.5}
                          />
                          <span className="text-[13.5px] text-text-secondary">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: credentials + sign in */}
                  <div className="md:w-[240px] flex-shrink-0 space-y-3">
                    <div>
                      <p className="text-[12px] uppercase tracking-[1px] font-medium text-text-tertiary mb-1">
                        Email
                      </p>
                      <div className="flex items-center gap-1.5">
                        <code className="flex-1 text-[13.5px] font-mono text-text-primary truncate">
                          {account.email}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(account.email, account.email)}
                          className="p-1.5 rounded-md bg-transparent border-none cursor-pointer text-text-tertiary hover:text-text-secondary hover:bg-cream-3/50 transition-all"
                        >
                          {copiedField === account.email ? (
                            <Check size={13} className="text-green" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    <a
                      href="/sign-in"
                      className={cn(
                        'flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-[15px] font-medium text-white no-underline transition-all duration-150 hover:-translate-y-px',
                      )}
                      style={{ background: account.color }}
                    >
                      Sign in as {account.role.toLowerCase()}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* What's in the demo */}
        <motion.div
          className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-[20px] font-semibold text-text-primary font-serif mb-4 text-center">
            What's in the demo workspace
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'Espresso', label: 'Plan' },
              { value: '5', label: 'Employees' },
              { value: '2', label: 'Shifts' },
              { value: '1', label: 'Manager' },
              { value: '25+', label: 'Attendance records' },
              { value: '3', label: 'Leave requests' },
              { value: '1', label: 'Closure' },
              { value: '3', label: 'User accounts' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center py-3 px-2 rounded-xl bg-cream/40 dark:bg-cream/5"
              >
                <p className="text-[22px] font-bold text-coffee leading-none mb-1">
                  {stat.value}
                </p>
                <p className="text-[12.5px] text-text-tertiary">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}
