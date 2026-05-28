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
  SlidersHorizontal,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/roles')({
  component: RolesPage,
});

type PermissionState = boolean | 'optional';

interface PermissionRow {
  /** When set, render a section header above this row using i18n. */
  sectionKey?: string;
  /** i18n key for the action label, looked up under `routes.roles.matrix.actions`. */
  key: string;
  employee: boolean;
  manager: PermissionState;
  managerNote?: string;
  owner: boolean;
}

const permissions: PermissionRow[] = [
  // Dashboard
  { sectionKey: 'dashboard', key: 'viewPersonalDashboard',  employee: true,  manager: false,        owner: false },
  { key: 'viewFullDashboard',                                employee: false, manager: 'optional',   managerNote: 'manage_attendance', owner: true },
  { key: 'viewTodayStats',                                   employee: false, manager: true,         owner: true },
  { key: 'seePendingLeaveCount',                             employee: false, manager: true,         owner: true },

  // Attendance
  { sectionKey: 'attendance', key: 'checkinOut',             employee: true,  manager: true,         owner: true },
  { key: 'viewOwnAttendance',                                employee: true,  manager: true,         owner: true },
  { key: 'viewAllAttendance',                                employee: false, manager: 'optional',   managerNote: 'manage_attendance', owner: true },
  { key: 'editAttendance',                                   employee: false, manager: 'optional',   managerNote: 'manage_attendance', owner: true },

  // Leave
  { sectionKey: 'leave', key: 'submitOwnLeave',              employee: true,  manager: true,         owner: true },
  { key: 'submitAnyLeave',                                   employee: false, manager: 'optional',   managerNote: 'manage_leave', owner: true },
  { key: 'viewOwnLeave',                                     employee: true,  manager: true,         owner: true },
  { key: 'viewAllLeave',                                     employee: false, manager: 'optional',   managerNote: 'manage_leave', owner: true },
  { key: 'approveLeave',                                     employee: false, manager: 'optional',   managerNote: 'manage_leave', owner: true },
  { key: 'cancelOwnLeave',                                   employee: true,  manager: true,         owner: true },
  { key: 'cancelAnyLeave',                                   employee: false, manager: 'optional',   managerNote: 'manage_leave', owner: true },

  // Employee management
  { sectionKey: 'employees', key: 'addEmployees',            employee: false, manager: 'optional',   managerNote: 'manage_employees', owner: true },
  { key: 'editEmployees',                                    employee: false, manager: 'optional',   managerNote: 'manage_employees', owner: true },
  { key: 'deleteEmployees',                                  employee: false, manager: 'optional',   managerNote: 'manage_employees', owner: true },
  { key: 'linkUsers',                                        employee: false, manager: false,        owner: true },
  { key: 'promoteManagers',                                  employee: false, manager: false,        owner: true },
  { key: 'editManagerPermissions',                           employee: false, manager: false,        owner: true },

  // Shifts & closures
  { sectionKey: 'shifts', key: 'viewShifts',                 employee: true,  manager: true,         owner: true },
  { key: 'editShifts',                                       employee: false, manager: 'optional',   managerNote: 'manage_shifts', owner: true },
  { key: 'perDaySchedules',                                  employee: false, manager: 'optional',   managerNote: 'manage_shifts', owner: true },
  { key: 'viewClosures',                                     employee: true,  manager: true,         owner: true },
  { key: 'editClosures',                                     employee: false, manager: 'optional',   managerNote: 'manage_closures', owner: true },

  // Workspace
  { sectionKey: 'workspace', key: 'viewWorkspace',           employee: true,  manager: true,         owner: true },
  { key: 'renameWorkspace',                                  employee: false, manager: false,        owner: true },
  { key: 'configureIp',                                      employee: false, manager: false,        owner: true },
  { key: 'configureDevice',                                  employee: false, manager: false,        owner: true },
  { key: 'configureGeofence',                                employee: false, manager: false,        owner: true },
  { key: 'subQrCodes',                                       employee: false, manager: false,        owner: true },
  { key: 'deleteWorkspace',                                  employee: false, manager: false,        owner: true },

  // Billing
  { sectionKey: 'billing', key: 'viewPlan',                  employee: true,  manager: true,         owner: true },
  { key: 'changePlan',                                       employee: false, manager: false,        owner: true },
  { key: 'paymentMethod',                                    employee: false, manager: false,        owner: true },
];

interface RoleCardShape {
  icon: React.ReactNode;
  key: 'owner' | 'manager' | 'employee';
  badgeKey?: string;
  color: string;
  highlightCount: number;
}

const roleCards: RoleCardShape[] = [
  { key: 'owner',    icon: <Building2 size={24} strokeWidth={1.6} />,    color: '#6B4226', highlightCount: 5 },
  { key: 'manager',  icon: <ShieldCheck size={24} strokeWidth={1.6} />,  color: '#C17F3B', highlightCount: 4, badgeKey: 'espresso' },
  { key: 'employee', icon: <UserCircle size={24} strokeWidth={1.6} />,   color: '#3B6FA0', highlightCount: 5 },
];

const voterLevels: { key: string; color: string }[] = [
  { key: 'view',         color: '#3B6FA0' },
  { key: 'capability',   color: '#C17F3B' },
  { key: 'editWorkspace', color: '#4A7C59' },
  { key: 'perQrManager', color: '#C0392B' },
];

function RolesPage() {
  const { t } = useTranslation();
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
            {t('routes.roles.eyebrow')}
          </p>
          <h1 className="text-[34px] md:text-[44px] font-semibold text-text-primary font-serif leading-tight">
            {t('routes.roles.title')}
          </h1>
          <p className="text-[17px] text-text-secondary mt-4 max-w-xl mx-auto">
            {t('routes.roles.subtitle')}
          </p>
        </motion.div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {roleCards.map((role, i) => {
            const highlights = t(`routes.roles.cards.${role.key}.highlights`, {
              returnObjects: true,
            }) as string[];
            return (
              <motion.div
                key={role.key}
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
                        {t(`routes.roles.cards.${role.key}.title`)}
                      </h3>
                      {role.badgeKey && (
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber/10 text-amber uppercase tracking-wider">
                          {t(`routes.roles.cards.${role.key}.badge`)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-[14.5px] text-text-secondary leading-relaxed mb-4">
                  {t(`routes.roles.cards.${role.key}.desc`)}
                </p>

                <ul className="space-y-2">
                  {highlights.map((h, hi) => (
                    <li key={hi} className="flex items-start gap-2">
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
            );
          })}
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
              {t('routes.roles.matrix.eyebrow')}
            </p>
            <h2 className="text-[28px] md:text-[34px] font-semibold text-text-primary font-serif leading-tight">
              {t('routes.roles.matrix.title')}
            </h2>
            <p className="text-[16px] text-text-secondary mt-3 max-w-lg mx-auto">
              {t('routes.roles.matrix.subtitle')}
            </p>

            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 text-[12.5px] text-text-tertiary">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green/10">
                  <Check size={11} className="text-green" strokeWidth={2.5} />
                </span>
                {t('routes.roles.matrix.legend.allowed')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber/15">
                  <SlidersHorizontal size={10} className="text-amber" strokeWidth={2.5} />
                </span>
                {t('routes.roles.matrix.legend.configurable')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cream-3/50">
                  <X size={11} className="text-text-tertiary/40" strokeWidth={2} />
                </span>
                {t('routes.roles.matrix.legend.notAvailable')}
              </span>
            </div>
          </div>

          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(107,66,38,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-cream-3">
                    <th className="px-5 py-4 text-[14px] font-semibold text-text-primary w-[45%]">
                      {t('routes.roles.matrix.headers.action')}
                    </th>
                    <th className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <UserCircle size={18} className="text-blue" />
                        <span className="text-[13px] font-semibold text-text-primary">{t('routes.roles.matrix.headers.employee')}</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <ShieldCheck size={18} className="text-amber" />
                        <span className="text-[13px] font-semibold text-text-primary">{t('routes.roles.matrix.headers.manager')}</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Building2 size={18} className="text-coffee" />
                        <span className="text-[13px] font-semibold text-text-primary">{t('routes.roles.matrix.headers.owner')}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((row) => (
                    <tr key={`${row.sectionKey ?? ''}-${row.key}`}>
                      <td className="px-5 py-3 border-b border-cream-3/50">
                        {row.sectionKey && (
                          <p className="text-[12px] uppercase tracking-[1px] font-semibold text-text-tertiary mb-1 mt-1">
                            {t(`routes.roles.matrix.sections.${row.sectionKey}`)}
                          </p>
                        )}
                        <span className="text-[14px] text-text-secondary">
                          {t(`routes.roles.matrix.actions.${row.key}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center border-b border-cream-3/50">
                        <PermissionIcon allowed={row.employee} />
                      </td>
                      <td className="px-4 py-3 text-center border-b border-cream-3/50">
                        <PermissionIcon allowed={row.manager} note={row.managerNote} configurableLabel={t('routes.roles.matrix.legend.configurable')} grantedViaLabel={(via) => t('routes.roles.matrix.grantedVia', { via })} />
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

        {/* How permissions work */}
        <motion.div
          className="mb-20 bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-8 md:p-10 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-2">
              {t('routes.roles.voter.title')}
            </h2>
            <p className="text-[15px] text-text-secondary max-w-lg mx-auto">
              {t('routes.roles.voter.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {voterLevels.map((p, i) => (
              <motion.div
                key={p.key}
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
                    {t(`routes.roles.voter.levels.${p.key}.label`)}
                  </span>
                  <span className="text-[12.5px] text-text-tertiary">{t(`routes.roles.voter.levels.${p.key}.who`)}</span>
                </div>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {t(`routes.roles.voter.levels.${p.key}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 px-4 py-3 rounded-xl bg-amber/8 border border-amber/15">
            <p className="text-[14px] text-text-secondary">
              <span className="font-medium text-amber">{t('routes.roles.voter.note.label')}</span>{' '}
              {t('routes.roles.voter.note.body')}
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
              <span className="font-medium text-amber">{t('routes.roles.limits.espressoLabel')}:</span> {t('routes.roles.limits.espresso')}
            </span>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border">
            <Crown size={16} className="text-coffee" />
            <span className="text-[14.5px] text-text-secondary">
              <span className="font-medium text-coffee">{t('routes.roles.limits.doubleEspressoLabel')}:</span> {t('routes.roles.limits.doubleEspresso')}
            </span>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border">
            <span className="text-[14.5px] text-text-tertiary">
              {t('routes.roles.limits.free')}
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
            {t('routes.roles.cta.title')}
          </h3>
          <p className="text-[16px] text-text-secondary mb-6">
            {t('routes.roles.cta.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/sign-up"
              className="btn-shimmer flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-[15px] font-semibold text-white no-underline transition-all hover:-translate-y-px"
            >
              {t('routes.roles.cta.getStartedFree')}
              <ChevronRight size={14} />
            </Link>
            <Link
              to="/features"
              className="px-6 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline transition-all hover:bg-cream-3"
            >
              {t('routes.roles.cta.viewFeatures')}
            </Link>
          </div>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}

function PermissionIcon({
  allowed,
  note,
  configurableLabel,
  grantedViaLabel,
}: {
  allowed: PermissionState;
  note?: string;
  configurableLabel?: string;
  grantedViaLabel?: (via: string) => string;
}) {
  if (allowed === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green/10">
        <Check size={14} className="text-green" strokeWidth={2.5} />
      </span>
    );
  }
  if (allowed === 'optional') {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber/15"
        title={note ? grantedViaLabel?.(note) ?? `Granted via ${note}` : configurableLabel ?? 'Configurable per manager'}
      >
        <SlidersHorizontal size={12} className="text-amber" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cream-3/50">
      <X size={14} className="text-text-tertiary/40" strokeWidth={2} />
    </span>
  );
}
