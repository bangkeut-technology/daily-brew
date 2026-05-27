<?php

declare(strict_types=1);

namespace App\Service\Seo;

/**
 * Single source of truth for server-rendered SEO metadata.
 *
 * The whole frontend is a client-rendered SPA served by {@see \App\Controller\SpaController}
 * for every non-API path, so without this the server returns an identical head (and HTTP 200)
 * for every URL. That produced two problems in Search Console:
 *   - unknown URLs (e.g. /status) returned 200 + a JS-rendered "not found" → flagged as soft 404;
 *   - every page advertised the homepage canonical, so real pages looked like duplicates of /.
 *
 * This resolver maps each path to its title/description, marks it indexable or not, and decides
 * the HTTP status (404 for unknown paths). The values feed base.html.twig so crawlers and
 * link-preview scrapers — neither of which run our JS — get correct, per-page metadata.
 */
final class SeoMetaResolver
{
    public const BASE_URL = 'https://dailybrew.work';

    private const SITE_NAME = 'DailyBrew';
    private const DEFAULT_DESCRIPTION = 'QR check-in, shift tracking, and leave management for restaurants. Free for up to 10 employees.';
    private const APP_TITLE = 'DailyBrew — Staff Attendance Tracking for Restaurants';

    /**
     * Public, indexable pages: path => [bare title, description].
     * The site name is appended to the title for every page except the homepage.
     * Copy is kept in sync with the per-page <PageSeo> calls in the React routes.
     *
     * @var array<string, array{string, string}>
     */
    private const INDEXABLE_PAGES = [
        '/' => [
            self::APP_TITLE,
            'QR check-in, shift tracking, and leave management for restaurants. Free for up to 10 employees. No hardware, no complexity — just scan and go.',
        ],
        '/features' => [
            'Features',
            'QR check-in, shift tracking, geofencing, device verification, leave management, and push notifications. Everything your restaurant needs for staff attendance.',
        ],
        '/features/device-verification' => [
            'Device Verification',
            'Prevent buddy punching by binding check-in and check-out to a single device per employee per day. Full audit trail included.',
        ],
        '/features/basilbook-integration' => [
            'BasilBook Integration',
            'Connect DailyBrew to BasilBook. Link employees by username and pull attendance data via a secure API — check-in times, late flags, and shift info.',
        ],
        '/features/geofencing' => [
            'Geofencing',
            'Draw a GPS perimeter around your restaurant. Staff must be physically within range to check in. Configurable radius from 50m to 5,000m.',
        ],
        '/features/ip-restriction' => [
            'IP Restriction',
            "Lock staff check-ins to your restaurant's WiFi or network. Prevent remote punching and ensure employees are on-site when they clock in.",
        ],
        '/how-it-works' => [
            'How it works',
            'Set up staff attendance tracking in minutes. Create a workspace, add employees, display a QR code, and track check-ins live from your dashboard.',
        ],
        '/demo' => [
            'Try the demo',
            'Experience DailyBrew with a pre-configured demo workspace. Sign in as an owner, manager, or employee to explore all features.',
        ],
        '/roles' => [
            'Roles and permissions',
            'Understand what owners, managers, and employees can do in DailyBrew. Full permissions matrix for attendance tracking, leave management, and workspace settings.',
        ],
        '/pricing' => [
            'Pricing',
            'DailyBrew plans start free for up to 10 employees. Espresso at $14.99/month adds geofencing, device verification, and leave management. Double Espresso for unlimited staff.',
        ],
        '/faq' => [
            'FAQ',
            'Frequently asked questions about DailyBrew. Learn about QR check-in, shifts, leave requests, pricing, and how to get started with attendance tracking.',
        ],
        '/support' => [
            'Support',
            'Get help with DailyBrew. Contact our team, report bugs, or submit feature requests for your restaurant attendance tracking.',
        ],
        '/guides' => [
            'Guides',
            'Step-by-step playbooks for owners, employees, and teams upgrading to Espresso. Pick the path that matches you.',
        ],
        '/guides/owner' => [
            'Owner setup guide',
            'From sign-up to live attendance in about 10 minutes. Step-by-step setup for restaurant owners using DailyBrew.',
        ],
        '/guides/employee' => [
            'Employee guide',
            'Install DailyBrew, link to your workspace, and scan the QR to clock in. Daily routine for restaurant staff.',
        ],
        '/guides/espresso' => [
            'Upgrade to Espresso',
            'Unlock leave management, geofencing, device verification, managers, and BasilBook integration on the Espresso plan.',
        ],
        '/guides/nfc' => [
            'Set up NFC check-in',
            'Step-by-step guide for restaurant owners to replace the QR scan with a one-second NFC tap. Buy stickers, program them with your workspace URL, and place them at the counter.',
        ],
        '/sign-up' => [
            'Sign up',
            'Create your free DailyBrew account. Start tracking staff attendance with QR check-in in minutes. No credit card required.',
        ],
        '/sign-in' => [
            'Sign in',
            'Sign in to DailyBrew to manage your restaurant staff attendance, shifts, and leave requests.',
        ],
        '/privacy' => [
            'Privacy policy',
            'How DailyBrew collects, uses, and protects your data. Learn about our privacy practices for attendance tracking, notifications, and payment processing.',
        ],
        '/terms' => [
            'Terms of use',
            'Terms governing the use of DailyBrew, including subscription plans, QR check-in, data handling, and account responsibilities.',
        ],
        '/refund' => [
            'Refund policy',
            'DailyBrew refund policy: refund eligibility, how to request a refund, processing times, and the difference between cancellation and refund.',
        ],
        '/delete-account' => [
            'Delete your account',
            'Request deletion of your DailyBrew account and all associated data including attendance records, workspaces, and employee profiles.',
        ],
    ];

    /** Valid SPA routes that must load (200) but must never be indexed. */
    private const PRIVATE_PREFIXES = ['/console', '/admin', '/checkin', '/auth'];

    /** Valid top-level SPA routes that load (200) but should not be indexed. */
    private const PRIVATE_PATHS = ['/onboarding', '/forgot-password', '/reset-password'];

    public function resolve(string $path): SeoMeta
    {
        $path = $this->normalize($path);

        if (isset(self::INDEXABLE_PAGES[$path])) {
            [$title, $description] = self::INDEXABLE_PAGES[$path];

            return new SeoMeta(
                title: $this->fullTitle($title, $path),
                description: $description,
                canonical: self::BASE_URL.($path === '/' ? '/' : $path),
                index: true,
                statusCode: 200,
            );
        }

        if ($this->isPrivatePath($path)) {
            return new SeoMeta(
                title: self::APP_TITLE,
                description: self::DEFAULT_DESCRIPTION,
                canonical: null,
                index: false,
                statusCode: 200,
            );
        }

        // Unknown path: return a real 404 so search engines drop it instead of
        // flagging a soft 404. The SPA shell still boots and renders its 404 view.
        return new SeoMeta(
            title: 'Page not found — '.self::SITE_NAME,
            description: self::DEFAULT_DESCRIPTION,
            canonical: null,
            index: false,
            statusCode: 404,
        );
    }

    private function normalize(string $path): string
    {
        // getPathInfo() already excludes the query string; guard anyway.
        $path = strtok($path, '?');
        $path = false === $path ? '/' : $path;

        // Drop a trailing slash on everything except the root.
        if ('/' !== $path && str_ends_with($path, '/')) {
            $path = rtrim($path, '/');
        }

        return '' === $path ? '/' : $path;
    }

    private function fullTitle(string $title, string $path): string
    {
        return '/' === $path ? $title : $title.' — '.self::SITE_NAME;
    }

    private function isPrivatePath(string $path): bool
    {
        if (in_array($path, self::PRIVATE_PATHS, true)) {
            return true;
        }

        foreach (self::PRIVATE_PREFIXES as $prefix) {
            if ($path === $prefix || str_starts_with($path, $prefix.'/')) {
                return true;
            }
        }

        return false;
    }
}
