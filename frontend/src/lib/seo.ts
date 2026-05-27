import type { Metadata } from "next";

export const SITE_NAME = "DailyBrew";
export const SITE_URL = "https://dailybrew.work";

const DEFAULT_TITLE = `${SITE_NAME} — Staff Attendance Tracking for Restaurants`;
const OG_IMAGE = "/android-chrome-512.png";

/**
 * Public, indexable pages: path => { title, description }.
 * Single source of truth for per-page metadata, ported from the Symfony
 * SeoMetaResolver so copy stays identical across the cutover. Each page's
 * `generateMetadata` calls {@link pageMetadata}; the sitemap reads the keys.
 */
export const PAGES = {
  "/": {
    title: DEFAULT_TITLE,
    description:
      "QR check-in, shift tracking, and leave management for restaurants. Free for up to 10 employees. No hardware, no complexity — just scan and go.",
  },
  "/features": {
    title: "Features",
    description:
      "QR check-in, shift tracking, geofencing, device verification, leave management, and push notifications. Everything your restaurant needs for staff attendance.",
  },
  "/features/device-verification": {
    title: "Device Verification",
    description:
      "Prevent buddy punching by binding check-in and check-out to a single device per employee per day. Full audit trail included.",
  },
  "/features/basilbook-integration": {
    title: "BasilBook Integration",
    description:
      "Connect DailyBrew to BasilBook. Link employees by username and pull attendance data via a secure API — check-in times, late flags, and shift info.",
  },
  "/features/geofencing": {
    title: "Geofencing",
    description:
      "Draw a GPS perimeter around your restaurant. Staff must be physically within range to check in. Configurable radius from 50m to 5,000m.",
  },
  "/features/ip-restriction": {
    title: "IP Restriction",
    description:
      "Lock staff check-ins to your restaurant's WiFi or network. Prevent remote punching and ensure employees are on-site when they clock in.",
  },
  "/how-it-works": {
    title: "How it works",
    description:
      "Set up staff attendance tracking in minutes. Create a workspace, add employees, display a QR code, and track check-ins live from your dashboard.",
  },
  "/demo": {
    title: "Try the demo",
    description:
      "Experience DailyBrew with a pre-configured demo workspace. Sign in as an owner, manager, or employee to explore all features.",
  },
  "/roles": {
    title: "Roles and permissions",
    description:
      "Understand what owners, managers, and employees can do in DailyBrew. Full permissions matrix for attendance tracking, leave management, and workspace settings.",
  },
  "/pricing": {
    title: "Pricing",
    description:
      "DailyBrew plans start free for up to 10 employees. Espresso at $14.99/month adds geofencing, device verification, and leave management. Double Espresso for unlimited staff.",
  },
  "/faq": {
    title: "FAQ",
    description:
      "Frequently asked questions about DailyBrew. Learn about QR check-in, shifts, leave requests, pricing, and how to get started with attendance tracking.",
  },
  "/support": {
    title: "Support",
    description:
      "Get help with DailyBrew. Contact our team, report bugs, or submit feature requests for your restaurant attendance tracking.",
  },
  "/guides": {
    title: "Guides",
    description:
      "Step-by-step playbooks for owners, employees, and teams upgrading to Espresso. Pick the path that matches you.",
  },
  "/guides/owner": {
    title: "Owner setup guide",
    description:
      "From sign-up to live attendance in about 10 minutes. Step-by-step setup for restaurant owners using DailyBrew.",
  },
  "/guides/employee": {
    title: "Employee guide",
    description:
      "Install DailyBrew, link to your workspace, and scan the QR to clock in. Daily routine for restaurant staff.",
  },
  "/guides/espresso": {
    title: "Upgrade to Espresso",
    description:
      "Unlock leave management, geofencing, device verification, managers, and BasilBook integration on the Espresso plan.",
  },
  "/guides/nfc": {
    title: "Set up NFC check-in",
    description:
      "Step-by-step guide for restaurant owners to replace the QR scan with a one-second NFC tap. Buy stickers, program them with your workspace URL, and place them at the counter.",
  },
  "/sign-up": {
    title: "Sign up",
    description:
      "Create your free DailyBrew account. Start tracking staff attendance with QR check-in in minutes. No credit card required.",
  },
  "/sign-in": {
    title: "Sign in",
    description:
      "Sign in to DailyBrew to manage your restaurant staff attendance, shifts, and leave requests.",
  },
  "/privacy": {
    title: "Privacy policy",
    description:
      "How DailyBrew collects, uses, and protects your data. Learn about our privacy practices for attendance tracking, notifications, and payment processing.",
  },
  "/terms": {
    title: "Terms of use",
    description:
      "Terms governing the use of DailyBrew, including subscription plans, QR check-in, data handling, and account responsibilities.",
  },
  "/refund": {
    title: "Refund policy",
    description:
      "DailyBrew refund policy: refund eligibility, how to request a refund, processing times, and the difference between cancellation and refund.",
  },
  "/delete-account": {
    title: "Delete your account",
    description:
      "Request deletion of your DailyBrew account and all associated data including attendance records, workspaces, and employee profiles.",
  },
} as const satisfies Record<string, { title: string; description: string }>;

export type IndexablePath = keyof typeof PAGES;

/**
 * Build per-page Next.js Metadata. The homepage uses an absolute title
 * (no `— DailyBrew` suffix); every other page relies on the title template
 * defined in the root layout. Canonical is the page's own path.
 */
export function pageMetadata(path: IndexablePath): Metadata {
  const { title, description } = PAGES[path];
  const isHome = path === "/";

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: isHome ? title : `${title} — ${SITE_NAME}`,
      description,
      url: path,
      images: [OG_IMAGE],
    },
    twitter: {
      title: isHome ? title : `${title} — ${SITE_NAME}`,
      description,
      images: [OG_IMAGE],
    },
  };
}
