import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware `Link` and navigation helpers for the marketing pages.
 *
 * A visitor reading `/fr/how-it-works` who clicks through to pricing should
 * land on `/fr/pricing`, not get dropped back to English. Plain `next/link`
 * would do the latter.
 *
 * Only use these for *marketing* destinations. Links into the console, admin
 * or auth (which live outside the `[locale]` segment) must stay `next/link`,
 * or they'd get a locale prefix that resolves to nothing.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
