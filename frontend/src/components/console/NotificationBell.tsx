"use client";

import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Placeholder for the upcoming in-app notification feed. Renders as a disabled
 * bell so the top bar layout stays consistent with the eventual feature — once
 * notifications land, wire this to the unread count + popover.
 */
export function NotificationBell() {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      disabled
      aria-label={t("notifications.title", "Notifications")}
      title={t("notifications.comingSoon", "Coming soon")}
      className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border-none bg-transparent text-text-tertiary transition-colors hover:bg-cream-3/40"
    >
      <Bell size={16} />
    </button>
  );
}
