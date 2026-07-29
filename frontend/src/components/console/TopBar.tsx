"use client";

import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LogoBrand } from "@/components/shared/Logo";
import { getWorkspacePublicId } from "@/lib/api";
import { usePlan } from "@/hooks/usePlan";
import { useRoleContext } from "@/hooks/useRoleContext";
import type { EmployeeRole } from "@/types/employee";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggleIcon } from "./ThemeToggleIcon";
import { UserAvatarMenu } from "./UserAvatarMenu";

interface Props {
  /** Renders the hamburger that opens the sidebar drawer on mobile. */
  onOpenMobileNav?: () => void;
}

/**
 * Sticky bar across the whole console layout.
 *
 * Left  — logo, then the workspace switcher. On mobile the logo gives way to
 *         the hamburger trigger.
 * Right — language, notification bell (placeholder), theme, avatar menu.
 */
export function TopBar({ onOpenMobileNav }: Props) {
  const { t } = useTranslation();
  const workspacePublicId = getWorkspacePublicId() ?? "";
  const { data: plan } = usePlan(workspacePublicId);
  const { data: roleContext } = useRoleContext();

  // Owned workspaces first, then the ones reached through an employee record —
  // minus any already listed as owned, so an owner who is also an employee of
  // their own restaurant doesn't see it twice.
  const workspaces = roleContext
    ? [
        ...(roleContext.ownedWorkspaces ?? []).map((ws) => ({ ...ws, role: "owner" as const })),
        ...(roleContext.linkedWorkspaces ?? [])
          .filter(
            (lw) =>
              lw.workspacePublicId &&
              !roleContext.ownedWorkspaces?.some((ow) => ow.publicId === lw.workspacePublicId),
          )
          .map((lw) => ({
            publicId: lw.workspacePublicId!,
            name: lw.workspaceName ?? "",
            role: (lw.role === "manager" ? "manager" : "employee") as EmployeeRole,
          })),
      ]
    : [];

  return (
    <header
      aria-label={t("nav.topbar", "Workspace bar")}
      className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-cream-3 bg-cream-2/95 px-3 backdrop-blur-md sm:px-5"
    >
      {onOpenMobileNav && (
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label={t("nav.openMenu", "Open menu")}
          className="-ml-1 p-2 text-text-secondary transition-colors hover:text-text-primary md:hidden"
        >
          <Menu size={20} />
        </button>
      )}

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <LogoBrand size={26} />
        </div>
        {roleContext && (
          <div className="w-full max-w-[260px] shrink-0 sm:max-w-[280px]">
            <WorkspaceSwitcher
              workspaces={workspaces}
              planLabel={plan?.planLabel}
              isEspresso={plan?.isEspresso}
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
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
