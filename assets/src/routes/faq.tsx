import { createFileRoute } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/faq')({
  component: FaqPage,
});

interface FaqEntry {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  items: FaqEntry[];
}

const faqSections: FaqSection[] = [
  {
    title: 'General',
    items: [
      {
        question: 'What is DailyBrew?',
        answer:
          'DailyBrew is a staff attendance tracking platform built for restaurants. It provides QR code check-in, shift management, closure periods, and leave request handling, all in one simple dashboard.',
      },
      {
        question: 'Who is DailyBrew for?',
        answer:
          'DailyBrew is designed for restaurant owners, managers, and staff. Owners manage the workspace, shifts, and employees. Managers can approve leave and oversee attendance. Staff check in and out by scanning the workspace QR code.',
      },
      {
        question: 'Is there a mobile app?',
        answer:
          'Staff check-in works entirely through the mobile web browser. When an employee scans their QR code, a mobile-optimized check-in page opens instantly. No app download is required.',
      },
    ],
  },
  {
    title: 'Plans & billing',
    items: [
      {
        question: "What's included in the Free plan?",
        answer:
          'The Free plan includes up to 10 employees, QR check-in, shift tracking, closure periods, and the attendance dashboard. It is free forever with no time limit.',
      },
      {
        question: "What's included in Espresso?",
        answer:
          'Espresso supports up to 20 employees and adds leave request management, IP restriction, device verification, geofencing, per-day shift schedules, manager role (up to 2), push and email notifications, and daily attendance summaries.',
      },
      {
        question: 'How much does Espresso cost?',
        answer:
          'Espresso costs $14.99 per month, or $149 per year if you choose annual billing. The yearly plan saves you $30.88 compared to paying monthly.',
      },
      {
        question: 'Can I cancel anytime?',
        answer:
          'Yes, there are no contracts or lock-in periods. You can cancel your Espresso subscription at any time from your dashboard Settings. After cancellation, you will continue to have access until the end of your current billing period.',
      },
    ],
  },
  {
    title: 'Check-in & attendance',
    items: [
      {
        question: 'How does QR check-in work?',
        answer:
          'Each workspace has a unique QR code. Display it at your restaurant entrance. Staff open the DailyBrew app, scan the QR code, and tap the Check In button to record their arrival. They scan again and tap Check Out when they leave.',
      },
      {
        question: 'What is geofencing?',
        answer:
          'Geofencing restricts check-in to a specific geographic area. You set a center point and a radius, and staff must be physically within that area to check in. This ensures attendance is only recorded when employees are actually at the restaurant.',
      },
      {
        question: 'What is IP restriction?',
        answer:
          'IP restriction only allows check-in from specific IP addresses, such as your restaurant WiFi network. When enabled, staff scanning the QR code from a different network will see a message explaining they need to be connected to the restaurant network.',
      },
      {
        question: 'What happens during closures?',
        answer:
          'When you define a closure period (for example, a holiday or renovation), no attendance is expected on those dates. The system skips those days entirely, so employees will not be marked as absent during closures.',
      },
    ],
  },
  {
    title: 'Manager role',
    items: [
      {
        question: 'What is the manager role?',
        answer:
          'The manager role lets you promote trusted employees to managers. Managers can view all attendance records, approve or reject leave requests, and cancel leave requests — without having full owner access to settings, shifts, or employee management.',
      },
      {
        question: 'How many managers can I have?',
        answer:
          'On the Espresso plan, you can have up to 2 managers per workspace. The Double Espresso plan allows unlimited managers.',
      },
      {
        question: 'How do I promote an employee to manager?',
        answer:
          'Go to the employee detail page and click "Promote to manager". The employee must have a linked user account (they need to sign in to use manager features). You can demote them back to a regular employee at any time.',
      },
      {
        question: 'What can a manager NOT do?',
        answer:
          'Managers cannot add, edit, or delete employees. They cannot manage shifts, closures, or workspace settings. They cannot manage billing or promote other employees. These actions are reserved for the workspace owner.',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        question: 'How do I sign up?',
        answer:
          'Click the "Get started" button on the homepage. Create an account with your email and password, then set up your workspace by naming your restaurant. From there you can add employees and generate QR codes.',
      },
      {
        question: 'Can I use Google or Apple to sign in?',
        answer:
          'Yes, DailyBrew supports both Google and Apple sign-in. You can link your account during registration or from your profile settings later.',
      },
      {
        question: 'How do I reset my password?',
        answer:
          'Click "Forgot password" on the sign-in page. Enter your email address and we will send you a password reset link. The link expires after 1 hour for security.',
      },
    ],
  },
];

function AccordionItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-cream-3/50 last:border-b-0"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-transparent border-none cursor-pointer group"
      >
        <span className="text-[16px] font-medium text-text-primary pr-4 group-hover:text-coffee transition-colors duration-200">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={16} className="text-text-tertiary" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5">
              <p className="text-[15px] text-text-secondary leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title="FAQ"
        description="Frequently asked questions about DailyBrew. Learn about QR check-in, shifts, leave requests, pricing, and how to get started with attendance tracking."
        path="/faq"
      />
      <LandingNav />

      <main className="page-enter pt-20">
        {/* Hero */}
        <section className="py-20 px-6 md:px-8 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
              FAQ
            </p>
            <h1 className="text-[34px] md:text-[42px] font-semibold text-text-primary font-serif leading-tight mb-4">
              Frequently asked questions
            </h1>
            <p className="text-[16px] text-text-secondary max-w-md mx-auto">
              Everything you need to know about DailyBrew. Can't find what you're
              looking for?{' '}
              <a
                href="mailto:support@dailybrew.work"
                className="text-coffee font-medium no-underline hover:text-coffee-light transition-colors"
              >
                Contact us
              </a>
            </p>
          </motion.div>
        </section>

        {/* FAQ sections */}
        <section className="px-6 md:px-8 max-w-2xl mx-auto pb-20 space-y-10">
          {faqSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: sectionIndex * 0.08 }}
            >
              <h2 className="text-[13px] uppercase tracking-[2px] font-medium text-text-tertiary mb-4 px-6">
                {section.title}
              </h2>
              <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
                {section.items.map((item, itemIndex) => (
                  <AccordionItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                    index={itemIndex}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {/* Bottom CTA */}
          <motion.div
            className="text-center pt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-[15px] text-text-secondary mb-4">
              Still have questions? We are happy to help.
            </p>
            <a
              href="mailto:support@dailybrew.work"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[15px] font-medium bg-coffee text-white no-underline transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
            >
              Contact support
            </a>
          </motion.div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
