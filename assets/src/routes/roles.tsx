import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Building2,
  ShieldCheck,
  UserCircle,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/roles')({
  component: RolesPage,
});

interface PermissionRow {
  section?: string;
  action: string;
  employee: boolean;
  manager: boolean;
  owner: boolean;
}

const permissions: PermissionRow[] = [
  // Dashboard
  { section: 'Dashboard', action: 'View personal dashboard', employee: true, manager: false, owner: false },
  { action: 'View full attendance dashboard (all employees)', employee: false, manager: true, owner: true },
  { action: 'View today\'s attendance stats', employee: false, manager: true, owner: true },
  { action: 'See pending leave count', employee: false, manager: true, owner: true },

  // Attendance
  { section: 'Attendance', action: 'Check in and check out via QR', employee: true, manager: true, owner: true },
  { action: 'View own attendance history', employee: true, manager: true, owner: true },
  { action: 'View all employees\' attendance', employee: false, manager: true, owner: true },

  // Leave requests
  { section: 'Leave requests', action: 'Submit own leave request', employee: true, manager: true, owner: true },
  { action: 'Submit leave for any employee', employee: false, manager: true, owner: true },
  { action: 'View own leave requests', employee: true, manager: true, owner: true },
  { action: 'View all leave requests', employee: false, manager: true, owner: true },
  { action: 'Approve or reject leave requests', employee: false, manager: true, owner: true },
  { action: 'Cancel own pending leave', employee: true, manager: true, owner: true },
  { action: 'Cancel any leave request', employee: false, manager: true, owner: true },

  // Employee management
  { section: 'Employee management', action: 'Add new employees', employee: false, manager: false, owner: true },
  { action: 'Edit employee details', employee: false, manager: false, owner: true },
  { action: 'Delete (soft) employees', employee: false, manager: false, owner: true },
  { action: 'Link / unlink user accounts', employee: false, manager: false, owner: true },
  { action: 'Promote / demote managers', employee: false, manager: false, owner: true },

  // Shifts & closures
  { section: 'Shifts & closures', action: 'View shifts', employee: true, manager: true, owner: true },
  { action: 'Create, edit, delete shifts', employee: false, manager: false, owner: true },
  { action: 'Manage per-day shift schedules', employee: false, manager: false, owner: true },
  { action: 'View closure periods', employee: true, manager: true, owner: true },
  { action: 'Create, edit, delete closures', employee: false, manager: false, owner: true },

  // Workspace settings
  { section: 'Workspace & settings', action: 'View workspace info', employee: true, manager: true, owner: true },
  { action: 'Rename workspace', employee: false, manager: false, owner: true },
  { action: 'Configure IP restriction', employee: false, manager: false, owner: true },
  { action: 'Configure device verification', employee: false, manager: false, owner: true },
  { action: 'Configure geofencing', employee: false, manager: false, owner: true },
  { action: 'Delete workspace', employee: false, manager: false, owner: true },

  // Billing
  { section: 'Billing', action: 'View current plan', employee: true, manager: true, owner: true },
  { action: 'Upgrade / downgrade plan', employee: false, manager: false, owner: true },
  { action: 'Manage payment method', employee: false, manager: false, owner: true },
];

const roleCards = [
  {
    icon: <Building2 size={24} strokeWidth={1.6} />,
    title: 'Owner',
    desc: 'The user who created the workspace. Full control over everything — employees, shifts, closures, settings, billing, and all attendance data.',
    color: '#6B4226',
    highlights: [
      'Creates and manages the workspace',
      'Adds, edits, and removes employees',
      'Configures all settings and security rules',
      'Promotes employees to managers',
      'Manages billing and subscription',
    ],
  },
  {
    icon: <ShieldCheck size={24} strokeWidth={1.6} />,
    title: 'Manager',
    badge: 'Espresso',
    desc: 'A trusted employee promoted by the owner. Can oversee attendance and handle leave approvals without full admin access.',
    color: '#C17F3B',
    highlights: [
      'Views the full attendance dashboard',
      'Sees all employees\' attendance records',
      'Approves or rejects leave requests',
      'Submits leave for any employee',
      'Still checks in/out like a regular employee',
    ],
  },
  {
    icon: <UserCircle size={24} strokeWidth={1.6} />,
    title: 'Employee',
    desc: 'A staff member linked to the workspace. Can check in, view personal data, and submit leave requests.',
    color: '#3B6FA0',
    highlights: [
      'Checks in and out by scanning the QR code',
      'Views own attendance history',
      'Submits leave requests (full or partial day)',
      'Cancels own pending leave requests',
      'Views own shift and closure info',
    ],
  },
];

function RolesPage() {
  return (
    <div className="min-h-screen">
      <PageSeo
        title="Roles and permissions"
        description="Understand what owners, managers, and employees can do in DailyBrew. Full permissions matrix for attendance tracking, leave management, and workspace settings."
        path="/roles"
      />
      <LandingNav />

      <div className="pt-28 pb-20 px-6 md:px-8 max-w-5xl mx-auto page-enter">
        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
            Roles & permissions
          </p>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight">
            Who can do what
          </h1>
          <p className="text-[17px] text-text-secondary mt-4 max-w-xl mx-auto">
            DailyBrew has three roles — owner, manager, and employee. Each
            with clear, well-defined permissions.
          </p>
        </motion.div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {roleCards.map((role, i) => (
            <motion.div
              key={role.title}
              className="group relative bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(107,66,38,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,66,38,0.10)]"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ background: role.color }}
              />

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: `${role.color}12`, color: role.color }}
                >
                  {role.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-semibold text-text-primary">
                      {role.title}
                    </h3>
                    {role.badge && (
                      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
                        {role.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[14.5px] text-text-secondary leading-relaxed mb-4">
                {role.desc}
              </p>

              <ul className="space-y-2">
                {role.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <Check
                      size={14}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: role.color }}
                      strokeWidth={2.5}
                    />
                    <span className="text-[14px] text-text-secondary">{h}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Permissions matrix */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
              Full breakdown
            </p>
            <h2 className="text-[28px] md:text-[34px] font-semibold text-text-primary font-serif leading-tight">
              Permissions matrix
            </h2>
            <p className="text-[16px] text-text-secondary mt-3 max-w-lg mx-auto">
              Every action mapped to every role. No surprises.
            </p>
          </div>

          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-cream-3">
                    <th className="px-5 py-4 text-[14px] font-semibold text-text-primary w-[45%]">
                      Action
                    </th>
                    <th className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <UserCircle size={18} className="text-blue" />
                        <span className="text-[13px] font-semibold text-text-primary">Employee</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <ShieldCheck size={18} className="text-amber" />
                        <span className="text-[13px] font-semibold text-text-primary">Manager</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Building2 size={18} className="text-coffee" />
                        <span className="text-[13px] font-semibold text-text-primary">Owner</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((row, i) => (
                    <tr key={`${row.section ?? ''}-${row.action}`}>
                      <td className="px-5 py-3 border-b border-cream-3/50">
                        {row.section && (
                          <p className="text-[12px] uppercase tracking-[1px] font-semibold text-text-tertiary mb-1 mt-1">
                            {row.section}
                          </p>
                        )}
                        <span className="text-[14px] text-text-secondary">{row.action}</span>
                      </td>
                      <td className="px-4 py-3 text-center border-b border-cream-3/50">
                        <PermissionIcon allowed={row.employee} />
                      </td>
                      <td className="px-4 py-3 text-center border-b border-cream-3/50">
                        <PermissionIcon allowed={row.manager} />
                      </td>
                      <td className="px-4 py-3 text-center border-b border-cream-3/50">
                        <PermissionIcon allowed={row.owner} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* How the voter works */}
        <motion.div
          className="mb-20 bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-8 md:p-10 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-2">
              How permissions work under the hood
            </h2>
            <p className="text-[15px] text-text-secondary max-w-lg mx-auto">
              DailyBrew uses four permission levels. Every API request is
              checked against these before any action is taken.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                level: 'VIEW',
                who: 'Owner, Manager, Employee',
                desc: 'Read-only access to workspace resources. All linked users get this.',
                color: '#3B6FA0',
              },
              {
                level: 'MANAGE',
                who: 'Owner, Manager',
                desc: 'Approve/reject leave, view all attendance and leave requests across the workspace.',
                color: '#C17F3B',
              },
              {
                level: 'EDIT',
                who: 'Owner only',
                desc: 'Create and update employees, shifts, closures, settings, and workspace details.',
                color: '#4A7C59',
              },
              {
                level: 'DELETE',
                who: 'Owner only',
                desc: 'Delete employees, shifts, closures, and the workspace itself.',
                color: '#C0392B',
              },
            ].map((p, i) => (
              <motion.div
                key={p.level}
                className="px-5 py-4 rounded-xl bg-cream/40 dark:bg-cream/5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-[13px] font-bold font-mono px-2 py-0.5 rounded"
                    style={{ background: `${p.color}15`, color: p.color }}
                  >
                    {p.level}
                  </span>
                  <span className="text-[12.5px] text-text-tertiary">{p.who}</span>
                </div>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 px-4 py-3 rounded-xl bg-amber/8 border border-amber/15">
            <p className="text-[14px] text-text-secondary">
              <span className="font-medium text-amber">Note:</span> Some actions
              have additional logic beyond the voter. For example, employees can
              only view and cancel their <em>own</em> leave requests, even though
              they have VIEW access. Managers see all leave requests but cannot
              edit employee records. The voter sets the baseline; controllers
              enforce finer-grained rules.
            </p>
          </div>
        </motion.div>

        {/* Manager limits */}
        <motion.div
          className="mb-20 flex items-center justify-center gap-3 flex-wrap"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border">
            <Crown size={16} className="text-amber" />
            <span className="text-[14.5px] text-text-secondary">
              <span className="font-medium text-amber">Espresso:</span> up to 2 managers
            </span>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border">
            <Crown size={16} className="text-coffee" />
            <span className="text-[14.5px] text-text-secondary">
              <span className="font-medium text-coffee">Double Espresso:</span> unlimited managers
            </span>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border">
            <span className="text-[14.5px] text-text-tertiary">
              Free plan: owner only
            </span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[24px] font-semibold text-text-primary font-serif mb-3">
            Ready to set up your team?
          </h3>
          <p className="text-[16px] text-text-secondary mb-6">
            Create your workspace, add employees, and promote your trusted staff.
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

function PermissionIcon({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green/10">
      <Check size={14} className="text-green" strokeWidth={2.5} />
    </span>
  ) : (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cream-3/50">
      <X size={14} className="text-text-tertiary/40" strokeWidth={2} />
    </span>
  );
}
