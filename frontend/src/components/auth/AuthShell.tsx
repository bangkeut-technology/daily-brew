"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/console/LanguageSwitcher";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      {/* The auth screens are the first thing a new user sees, and they land
          here before any profile locale exists to follow. */}
      <div className="absolute right-4 top-4 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="font-serif text-2xl font-semibold text-coffee no-underline">
            DailyBrew
          </Link>
        </div>
        <div className="glass-card p-8">
          <h1 className="font-serif text-2xl font-semibold text-text-primary">{title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-5 text-center text-sm text-text-secondary">{footer}</p>
      </div>
    </div>
  );
}

const fieldClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2.5 text-[15px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20";

export { fieldClass };

export function OAuthButtons() {
  const { t } = useTranslation();
  // These are Symfony OAuth endpoints (proxied to the backend), not Next.js
  // routes — they require a real full-page navigation, so a plain <a> is correct.
  const linkClass =
    "flex items-center justify-center gap-2 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2.5 text-sm font-medium text-text-primary no-underline transition-colors hover:bg-cream-3";
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/oauth/auth/google" className={linkClass}>
        {t("auth.google", "Google")}
      </a>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/oauth/auth/apple" className={linkClass}>
        {t("auth.apple", "Apple")}
      </a>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-cream-3" />
      <span className="text-xs text-text-tertiary">or</span>
      <span className="h-px flex-1 bg-cream-3" />
    </div>
  );
}
