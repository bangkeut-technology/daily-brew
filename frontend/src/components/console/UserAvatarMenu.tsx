"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, UserCircle, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/auth-provider";
import { Avatar } from "@/components/shared/Avatar";
import { cn } from "@/lib/utils";

/**
 * Top-bar avatar trigger with a dropdown menu (Profile / Admin panel / Sign
 * out). Sign-out submits a real form POST so the browser follows the redirect
 * and processes the Set-Cookie headers that clear the JWT + refresh cookies.
 */
export function UserAvatarMenu() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "";

  const signOut = () => {
    sessionStorage.removeItem("workspace_public_id");
    // Read the live i18n locale rather than sessionStorage directly: the
    // language provider keeps both in sync, but this survives anyone changing
    // the storage key later.
    const locale = (i18n.language ?? "en").split("-")[0];
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/api/v1/${locale}/auth/logout`;
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("nav.userMenu", "User menu")}
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-transparent py-1 pl-1 pr-2 transition-colors hover:bg-cream-3/40"
      >
        <Avatar name={displayName} imageUrl={user?.avatarUrl} index={0} size={28} />
        <ChevronDown
          size={14}
          className={cn("text-text-tertiary transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-cream-3 bg-cream shadow-lg"
        >
          <div className="border-b border-cream-3/60 px-4 py-3">
            {displayName && (
              <div className="truncate text-[13.5px] font-medium text-text-primary">
                {displayName}
              </div>
            )}
            {user?.email && (
              <div className="truncate text-[12px] text-text-tertiary">{user.email}</div>
            )}
          </div>
          <div className="py-1">
            <Link
              href="/console/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-[14px] text-text-primary no-underline transition-colors hover:bg-glass-bg"
            >
              <UserCircle size={15} />
              {t("nav.profile", "Profile")}
            </Link>
            {user?.isSuperAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[14px] text-coffee no-underline transition-colors hover:bg-coffee/8"
              >
                <ShieldCheck size={15} />
                {t("nav.adminPanel", "Admin panel")}
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-4 py-2 text-left text-[14px] text-text-primary transition-colors hover:bg-glass-bg"
            >
              <LogOut size={15} />
              {t("nav.signOut", "Sign out")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
