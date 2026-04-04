import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  ArrowRightLeft, Shield, CheckCircle, ChevronRight, Crown,
  ArrowLeft, HelpCircle, Users, Key, Code, Clock,
  Link2, Database, Smartphone, ShieldCheck,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { BasilBookBrand } from '@/components/shared/BasilBookBrand';

export const Route = createFileRoute('/features/basilbook-integration')({
  component: BasilBookIntegrationPage,
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

function BasilBookIntegrationPage() {
  return (
    <div className="min-h-screen">
      <PageSeo
        title="BasilBook Integration"
        description="Connect DailyBrew to BasilBook. Link employees by username and pull attendance data via a secure API — check-in times, late flags, and shift info."
        path="/features/basilbook-integration"
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
            <div className="w-14 h-14 rounded-2xl bg-[#2bb673]/10 flex items-center justify-center">
              <ArrowRightLeft size={28} className="text-[#2bb673]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
                Espresso
              </span>
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#2bb673]/8 text-[#2bb673] uppercase tracking-wider">
                Integration
              </span>
            </div>
          </div>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight mb-4">
            <BasilBookBrand className="text-[34px] md:text-[44px]" /> integration
          </h1>
          <p className="text-[18px] md:text-[20px] text-text-secondary leading-relaxed max-w-2xl">
            Connect DailyBrew to your BasilBook accounting system. Link employees by username,
            generate a secure API key, and let BasilBook pull attendance data automatically —
            check-in times, late flags, shift info, all in one call.
          </p>
        </motion.div>

        {/* The problem */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            The problem
          </h2>
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center shrink-0 mt-1">
                <Database size={20} className="text-red" />
              </div>
              <div className="space-y-3">
                <p className="text-[16px] text-text-primary font-medium">
                  Attendance data lives in DailyBrew. Accounting data lives in BasilBook. Neither talks to the other.
                </p>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  Without integration, you'd have to manually cross-reference who was present,
                  who was late, and what shifts were worked — then enter that into your accounting
                  system by hand. That's error-prone, slow, and nobody wants to do it.
                </p>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  The BasilBook integration bridges the gap. BasilBook can pull attendance data
                  directly from DailyBrew via a secure API, matching staff by username.
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
                icon: <Link2 size={20} />,
                title: 'Link employees by username',
                desc: 'Each employee in DailyBrew can have a username — this is the same identifier used in BasilBook for that staff member. When BasilBook pulls attendance data, it matches records by this username.',
              },
              {
                icon: <Key size={20} />,
                title: 'Generate a secure API token',
                desc: 'In your workspace settings, generate an API token. The full token is shown once — copy it and store it in BasilBook. DailyBrew only stores a hash, so the plain token can never be retrieved again.',
              },
              {
                icon: <Code size={20} />,
                title: 'BasilBook calls the attendance API',
                desc: 'BasilBook sends a GET request with the API key in the X-Api-Key header, specifying a date range (up to 93 days). DailyBrew returns attendance records for all employees with a username — check-in/out times, late flags, shift info, all formatted in your workspace timezone.',
              },
              {
                icon: <ArrowRightLeft size={20} />,
                title: 'Data flows automatically',
                desc: 'Once configured, BasilBook can pull attendance data on any schedule — daily, weekly, or on demand. No manual exports, no CSV files, no copy-pasting. The data is always fresh and formatted for BasilBook\'s needs.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2bb673]/10 flex items-center justify-center text-[#2bb673] shrink-0">
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

        {/* What the API returns */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-6">
            What the API returns
          </h2>
          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <p className="text-[15px] text-text-secondary leading-relaxed mb-5">
              For each employee with a username, the API returns their attendance records
              within the requested date range:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Username', desc: 'The BasilBook linking key' },
                { label: 'Employee name', desc: 'Full name for display' },
                { label: 'Shift name', desc: 'Assigned shift, or null' },
                { label: 'Date', desc: 'Calendar date (YYYY-MM-DD)' },
                { label: 'Check-in time', desc: 'HH:mm in workspace timezone' },
                { label: 'Check-out time', desc: 'HH:mm, or null if still working' },
                { label: 'Late flag', desc: 'true if arrived after shift start' },
                { label: 'Left early flag', desc: 'true if left before shift end' },
              ].map((field) => (
                <div key={field.label} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-cream/40 dark:bg-cream/5">
                  <CheckCircle size={14} className="text-[#2bb673] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[14px] font-medium text-text-primary">{field.label}</span>
                    <span className="text-[13px] text-text-tertiary ml-1.5">— {field.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[14px] text-text-tertiary mt-4">
              Days with no attendance record are omitted — absence is implied by missing dates.
              Maximum date range per request: 93 days.
            </p>
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
                icon: <ArrowRightLeft size={20} />,
                title: 'No manual data entry',
                desc: 'Attendance data flows from DailyBrew to BasilBook automatically. No spreadsheets, no copy-pasting, no errors from manual transcription.',
              },
              {
                icon: <Clock size={20} />,
                title: 'Always up to date',
                desc: 'BasilBook pulls live data from DailyBrew. Whether it queries daily or weekly, the data reflects the latest check-ins, late flags, and shift assignments.',
              },
              {
                icon: <Shield size={20} />,
                title: 'Secure by design',
                desc: 'API tokens are hashed on storage — the plain token is shown once and never stored. Tokens can be revoked instantly. Each token is scoped to one workspace.',
              },
              {
                icon: <Users size={20} />,
                title: 'Username-based matching',
                desc: 'Staff are linked by username across both systems. No fragile email matching or manual ID mapping. Set the username once and the link works automatically.',
              },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="w-10 h-10 rounded-xl bg-[#2bb673]/10 flex items-center justify-center text-[#2bb673] mb-4">
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
            Two parts: link your employees by username, then generate an API token for BasilBook.
          </p>

          <div className="space-y-6">
            {[
              {
                step: '1',
                icon: <Users size={20} />,
                title: 'Set employee usernames',
                desc: 'Go to each employee\'s detail page and enter their BasilBook username. This must match the staff name or ID used in your BasilBook system exactly.',
              },
              {
                step: '2',
                icon: <Key size={20} />,
                title: 'Generate an API token',
                desc: 'Go to Settings, scroll to "API tokens", and click "Generate token". Give it a name (e.g., "BasilBook production"). The full token is shown once — copy it immediately.',
              },
              {
                step: '3',
                icon: <Code size={20} />,
                title: 'Configure BasilBook',
                desc: 'In BasilBook, enter the API token in the DailyBrew integration settings. BasilBook will use it in the X-Api-Key header when pulling attendance data.',
              },
              {
                step: '4',
                icon: <CheckCircle size={20} />,
                title: 'Test the connection',
                desc: 'Trigger a test pull from BasilBook. You should see attendance records for all employees with a username. If an employee is missing, check that their username is set in DailyBrew.',
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                className="flex items-start gap-5"
                {...stagger(i)}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-coffee flex items-center justify-center text-[16px] font-bold text-white shrink-0">
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
                q: 'What if I lose the API token?',
                a: 'The plain token is only shown once at creation. If you lose it, revoke the old token and generate a new one. Update the new token in BasilBook.',
              },
              {
                q: 'Can I have multiple API tokens?',
                a: 'Yes. You can generate multiple tokens — for example, one for production and one for testing. Each token can be revoked independently.',
              },
              {
                q: 'What if an employee doesn\'t have a username?',
                a: 'They won\'t appear in the API response. Only employees with a username set are included. This is intentional — the username is the linking key between DailyBrew and BasilBook.',
              },
              {
                q: 'What\'s the maximum date range?',
                a: '93 days per request. For longer periods, make multiple requests with consecutive date ranges.',
              },
              {
                q: 'Does BasilBook push data to DailyBrew?',
                a: 'No. The integration is one-way: BasilBook pulls attendance data from DailyBrew. DailyBrew does not receive or modify any BasilBook data.',
              },
              {
                q: 'What timezone are the times in?',
                a: 'All times in the API response are formatted in your workspace timezone (e.g., Asia/Phnom_Penh). The timezone is included in the response so BasilBook can interpret the times correctly.',
              },
            ].map((faq, i) => (
              <motion.div
                key={faq.q}
                className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
                {...stagger(i)}
              >
                <div className="flex items-start gap-3">
                  <HelpCircle size={18} className="text-amber mt-0.5 shrink-0" />
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
          <Crown size={20} className="text-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-[15px] font-semibold text-text-primary mb-1">
              Available on the Espresso plan
            </p>
            <p className="text-[14.5px] text-text-secondary leading-relaxed">
              BasilBook integration and API tokens are included in the Espresso plan ($14.99/month
              or $149/year). Employee usernames for cross-product linking are also Espresso-only.
            </p>
          </div>
        </motion.div>

        {/* Related features */}
        <motion.div className="mb-16" {...fadeUp}>
          <h2 className="text-[20px] font-semibold text-text-primary font-serif mb-6">
            Related features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Lock check-ins to your restaurant's WiFi.
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
                Prevent buddy punching with device binding.
              </p>
            </Link>
            <Link
              to="/roles"
              className="group bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 shadow-[0_2px_12px_rgba(107,66,38,0.05)] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-coffee/10 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-coffee" />
                </div>
                <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-coffee transition-colors">
                  Roles and permissions
                </h3>
                <ChevronRight size={14} className="text-text-tertiary ml-auto" />
              </div>
              <p className="text-[14px] text-text-secondary">
                Delegate attendance and leave management.
              </p>
            </Link>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div className="text-center" {...fadeUp}>
          <h3 className="text-[24px] font-semibold text-text-primary font-serif mb-3">
            Ready to connect your systems?
          </h3>
          <p className="text-[16px] text-text-secondary mb-6">
            Start free, upgrade to Espresso when you need the integration.
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
