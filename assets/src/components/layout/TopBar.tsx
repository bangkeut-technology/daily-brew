import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LogoBrand } from '@/components/shared/Logo';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { usePlan } from '@/hooks/queries/usePlan';
import { getWorkspacePublicId } from '@/lib/auth';
import type { EmployeeRole } from '@/types';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { NotificationBell } from './NotificationBell';
import { ThemeToggleIcon } from './ThemeToggleIcon';
import { UserAvatarMenu } from './UserAvatarMenu';

interface Props {
  /** When provided, renders a hamburger button on mobile that triggers the sidebar drawer. */
  onOpenMobileNav?: () => void;
}

/**
 * Sticky topbar across the whole console layout.
 *
 * Left  — DailyBrew logo + "Console" label, then the workspace switcher chip.
 *         On mobile the logo is replaced by the hamburger trigger.
 * Right — language toggle, notification bell (placeholder), theme toggle,
 *         user avatar menu (Profile / Admin panel / Sign out).
 *
 * Items moved here from the sidebar bottom (workspace, language, theme,
 * sign-out, profile, admin) so the sidebar can shrink to pure navigation.
 */
export function TopBar({ onOpenMobileNav }: Props) {
  const { t } = useTranslation();
  const workspacePublicId = getWorkspacePublicId() ?? '';
  const { data: plan } = usePlan(workspacePublicId);
  const { data: roleContext } = useRoleContext();

  const workspaces = roleContext
    ? [
        ...(roleContext.ownedWorkspaces ?? []).map((ws) => ({ ...ws, role: 'owner' as const })),
        ...(roleContext.linkedWorkspaces ?? [])
          .filter((lw) => lw.workspacePublicId && !roleContext.ownedWorkspaces?.some((ow) => ow.publicId === lw.workspacePublicId))
          .map((lw) => ({
            publicId: lw.workspacePublicId!,
            name: lw.workspaceName ?? '',
            role: (lw.role === 'manager' ? 'manager' : 'employee') as EmployeeRole,
          })),
      ]
    : [];

  return (
    <header
      className="fixed top-0 left-0 right-0 h-14 z-40 bg-cream-2/95 backdrop-blur-md border-b border-cream-3 flex items-center px-3 sm:px-5 gap-3"
      aria-label={t('nav.topbar', 'Workspace bar')}
    >
      {/* Mobile hamburger — only when the trigger is provided */}
      {onOpenMobileNav && (
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden p-2 -ml-1 text-text-secondary hover:text-text-primary transition-colors"
          aria-label={t('nav.openMenu', 'Open menu')}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Left: brand + workspace switcher */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <LogoBrand size={26} />
        </div>
        {roleContext && (
          <div className="w-full max-w-[260px] sm:max-w-[280px] shrink-0">
            <WorkspaceSwitcher
              workspaces={workspaces}
              planLabel={plan?.planLabel}
              isEspresso={plan?.isEspresso}
            />
          </div>
        )}
      </div>

      {/* Right: language, bell, theme, avatar */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        <NotificationBell />
        <ThemeToggleIcon />
        <UserAvatarMenu />
      </div>
    </header>
  );
}
