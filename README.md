# DailyBrew

Staff attendance and leave tracking for restaurants.

## Overview

DailyBrew helps restaurant owners manage their team's daily attendance through QR code check-ins, shift management, and leave request handling.

**Key features:**
- QR code check-in/check-out for staff (auth required via linked user account), plus NFC tag and tap-terminal check-in
- Late arrival and early departure detection, with per-shift grace minutes
- Device verification — same device must check in and check out, prevents one phone checking in multiple employees
- New-device anomaly alerts — a check-in from an unrecognised device pings the owner (Telegram + push)
- Shift and closure management, including per-day shift schedules (a shift with per-day rules *is* its complete schedule; unlisted days are off-days)
- Leave request workflow — employees submit (full-day or partial-day with time range), owners approve/reject, employees can cancel pending requests
- Attendance corrections with a full audit trail — managers can backfill a forgotten scan, fix a wrong time, or void a bad row; originals are snapshotted and every edit records who, when, and why
- Per-employee attendance tracking modes — admin helpers and flexible-hours staff can be excluded from the absent count without losing their check-in times
- Owner dashboard with today's stats plus rolling attendance/punctuality trends
- Manager role with granular permissions — promote trusted employees and choose exactly which areas they can administer: employees, shifts, closures, leave, attendance. Newly promoted managers default to leave + attendance only. Workspace settings, billing, sub-QR codes, and promoting other managers stay with the owner. (Espresso: up to 2, Double Espresso: unlimited, also assignable per sub-QR)
- Employee dashboard with personal attendance, shift, and leave request submission
- IP restriction for check-in locations (with "Use my current IP" helper)
- Geofencing for check-in (GPS radius)
- Multiple QR codes on Double Espresso — one per entrance or station, each with its own roster and its own IP / geofence / device rules
- Attendance export to XLSX and PDF, plus a BasilBook accounting feed
- Dual role system — users can be owners and/or employees across workspaces
- Push notifications via Expo (leave requests, shift changes, closures), Telegram alerts, and email via Mailgun (same events + daily attendance summary and shift digests for Espresso)
- Per-workspace timezone with auto-detection — works worldwide (Asia, Europe, Americas)
- Multi-language support (English, French, Khmer)
- Dark mode with warm coffee tones
- Platform admin console for DailyBrew staff — accounts, subscriptions, churn, feature-flag rollout, and the cron scheduler

## Plans

| Feature                             | Free     | Espresso ($19.99/mo · $199/yr) | Double Espresso ($39.99/mo · $399/yr) |
|-------------------------------------|----------|--------------------------------|---------------------------------------|
| Employees                           | Up to 10 | Up to 20                       | Unlimited                             |
| QR check-in                         | Yes      | Yes                            | Yes                                   |
| Shifts & closures                   | Yes      | Yes                            | Yes                                   |
| Dashboard & attendance log          | Yes      | Yes                            | Yes                                   |
| Attendance corrections & audit trail | Yes     | Yes                            | Yes                                   |
| Leave requests                      | -        | Yes                            | Yes                                   |
| Manager role (granular permissions)  | -        | Up to 2                        | Unlimited                             |
| Multiple QR codes (sub-workspaces)  | -        | -                              | Yes (per-QR IP / geofence / device)   |
| Per-QR manager assignment           | -        | -                              | Yes                                   |
| IP restriction                      | -        | Yes                            | Yes                                   |
| Device verification                 | -        | Yes                            | Yes                                   |
| New-device anomaly alerts           | -        | Yes                            | Yes                                   |
| Geofencing                          | -        | Yes                            | Yes                                   |
| Per-day shift schedules             | -        | Yes                            | Yes                                   |
| NFC & tap check-in                  | -        | Yes                            | Yes                                   |
| Attendance export (XLSX / PDF)      | -        | Yes                            | Yes                                   |
| Employee username (BasilBook)       | -        | Yes                            | Yes                                   |
| BasilBook API (attendance)          | -        | Yes                            | Yes                                   |
| Push & email notifications          | -        | Yes                            | Yes                                   |
| Telegram notifications & alerts     | -        | Yes                            | Yes                                   |
| Daily summary & shift digests       | -        | Yes                            | Yes                                   |
| Priority support                    | -        | -                              | Yes                                   |

Plan gating lives in a single place — `App\Service\PlanService`. A downgrade never deletes data: existing employees, managers, and sub-QRs stay visible, the quota checks simply start returning `false`.

Payments are handled via **Paddle**.

## Tech Stack

### Backend
- PHP 8.4+ / Symfony 8.0
- Doctrine ORM + MySQL 8.4
- LexikJWTAuthenticationBundle (JWT) + gesdinet/jwt-refresh-token (single-use refresh tokens)
- KnpPaginatorBundle, VichUploaderBundle (avatars / logos / employee photos)
- dukecity/command-scheduler (cron schedules, driven from the admin console)

### Frontend (two, both shipped)
- **`assets/` — legacy SPA**, still the default: React 19 + TypeScript, Symfony Webpack Encore, TanStack Router (file-based routing) + TanStack Query
- **`frontend/` — Next.js App Router port** (Phase 6), served as a Node standalone build behind nginx; not yet cut over in production
- Shared conventions across both: Tailwind CSS v4, Radix UI + shadcn/ui, clsx + tailwind-merge (`cn()` utility), i18next / next-intl (en, fr, km), Lucide React (icons), Sonner (toasts), Zod + React Hook Form

### Packages (`packages/`)
- `bangkeut/tap-core` — framework-free tap credential verification, wired in via Composer path repositories
- `bangkeut/tap-bundle` — Symfony wiring for the above; inert until a host app implements its store interfaces

### Notifications
- Expo Push Notifications (mobile push)
- Symfony Mailer + Mailgun (email, including inbound → support)
- Telegram bot (group alerts + personal notifications)
- Console commands for the daily summary (`dailybrew:send-daily-summary`) and shift digests (`dailybrew:scan-shift-summaries`)

## Getting Started

### Prerequisites
- PHP 8.4+ with `date.timezone = UTC` (all timestamps are stored in UTC and rendered per workspace timezone)
- Composer
- Node.js 20+
- MySQL 8.4 — **not Postgres.** Every migration is MySQL-pure and CI runs `mysql:8.4`; `compose.yaml` ships a matching container.

### Backend Setup

```bash
# Start the database (MySQL 8.4 on 127.0.0.1:3306 — root/root, db: dailybrew)
docker compose up -d database

# Install dependencies
composer install

# The default DATABASE_URL in .env already points at the compose container.
# For your own server:
# DATABASE_URL="mysql://user:pass@127.0.0.1:3306/dailybrew?serverVersion=8.4.0&charset=utf8mb4"

# Run migrations (never `make:migration` against an existing schema without reviewing the diff)
php bin/console doctrine:migrations:migrate

# Generate JWT keypair
php bin/console lexik:jwt:generate-keypair

# Start dev server
symfony server:start
# or: php -S localhost:8000 -t public
```

### Frontend Setup

The legacy SPA is what the Symfony app serves today:

```bash
npm ci
npm run router:generate   # generate TanStack Router route tree
npm run dev               # encore dev (use `npm run watch` to rebuild on change)
npm run build             # encore production
npm run lint              # eslint assets/src/
```

The Next.js port lives in `frontend/` and talks to the same API through a same-origin proxy:

```bash
cd frontend
npm ci
npm run dev               # next dev
npm run build             # next build (standalone output, used by the deploy workflow)
```

### Tests

```bash
php bin/phpunit                              # everything
php bin/phpunit --testsuite="Project Test Suite"   # application tests
php bin/phpunit --testsuite=Packages         # packages/*/tests — must not depend on App\
```

### Paddle Setup (for paid plans)

1. Create a Paddle account and set up products/prices for the Espresso and Double Espresso plans (monthly + annual each)
2. Configure webhook URL: `https://yourdomain.com/api/v1/webhooks/paddle`
3. Set environment variables in `.env.local`:

```env
PADDLE_ENVIRONMENT=sandbox            # or production
PADDLE_WEBHOOK_SECRET=your_webhook_secret
PADDLE_API_KEY=your_api_key
PADDLE_CLIENT_SIDE_TOKEN=your_client_token
PADDLE_PRICE_ID_ESPRESSO_MONTHLY=pri_xxxxx
PADDLE_PRICE_ID_ESPRESSO_ANNUAL=pri_xxxxx
PADDLE_PRICE_ID_DOUBLE_ESPRESSO_MONTHLY=pri_xxxxx
PADDLE_PRICE_ID_DOUBLE_ESPRESSO_ANNUAL=pri_xxxxx
```

When creating a Paddle checkout, pass the workspace ID in `custom_data`:
```json
{
  "custom_data": {
    "workspace_public_id": "your-workspace-uuid"
  }
}
```

### Other integrations

All optional — each one degrades to "feature switched off" rather than breaking startup:

```env
GOOGLE_CLIENT_ID= / GOOGLE_CLIENT_SECRET= / GOOGLE_IOS_CLIENT_ID= / GOOGLE_ANDROID_CLIENT_ID=
APPLE_CLIENT_ID= / APPLE_IOS_CLIENT_ID= / APPLE_TEAM_ID= / APPLE_KEY_ID= / APPLE_PRIVATE_KEY=
MAILER_DSN=                     # Mailgun; NO_REPLY_EMAIL sets the From address
MAILGUN_WEBHOOK_SIGNING_KEY=    # verifies inbound support email
TELEGRAM_BOT_TOKEN= / TELEGRAM_BOT_USERNAME= / TELEGRAM_WEBHOOK_SECRET=
SUPPORTDOCK_API_KEY=            # feedback relay — the browser must never call SupportDock directly (CORS)
GA_MEASUREMENT_ID=
```

## Console Commands

```bash
php bin/console dailybrew:send-daily-summary      # run hourly; sends per workspace when its local clock hits --hour (default 18:00)
php bin/console dailybrew:scan-shift-summaries    # run every 5 min; shift start+30 / end+30 digests
php bin/console dailybrew:admin:promote-user <email>   # idempotent; the only way to mint the first super-admin
php bin/console dailybrew:seed-reviewer [--fresh]      # demo workspace, see below

# Subscriptions whose status drifted away from their cancellation. Reports by default:
php bin/console dailybrew:admin:repair-subscriptions
php bin/console dailybrew:admin:repair-subscriptions --apply                     # fix locally
php bin/console dailybrew:admin:repair-subscriptions --apply --cancel-at-paddle  # also cancel at Paddle
```

The first two are also schedulable (and runnable on demand) from `/admin/cron`, which records each run with its exit code and output tail.

`repair-subscriptions` is a one-off repair, not a routine: `--cancel-at-paddle` cancels real subscriptions, so it refuses to run without `--apply` and is never scheduled.

## Reviewer / Demo Accounts

Seed a fully configured demo workspace (Espresso plan) for App Store / Google Play reviewers or live demos:

```bash
php bin/console dailybrew:seed-reviewer         # first run
php bin/console dailybrew:seed-reviewer --fresh  # re-seed (purge + recreate)
```

| Role     | Email                   | Linked to                                            |
|----------|-------------------------|------------------------------------------------------|
| Owner    | reviewer@dailybrew.work | Full dashboard access                                |
| Manager  | manager@dailybrew.work  | Sophea Chan — granted "manage leave" + "manage attendance" by default |
| Employee | employee@dailybrew.work | Dara Sok — can view own attendance, submit leave     |

All share the same password: `DailyBrew2026!`

The demo workspace ("The Daily Grind") is pre-configured with the **Espresso plan** and includes:
- 5 employees across 2 shifts (Morning & Evening)
- 1 manager (Sophea Chan)
- 7 days of attendance records with late arrivals, early departures, and absences
- 3 leave requests (approved, pending, rejected)
- 1 upcoming closure (Khmer New Year)

All three accounts can be used to experience the app from each role's perspective — owner, manager, and employee.

## Documentation

- [docs/architecture.md](./docs/architecture.md) — project structure, ER diagram, the QR check-in / leave request / authentication flow diagrams, plan gating and manager permissions, auth & token hygiene, platform admin, feature flags, and the monorepo packages
- [docs/api.md](./docs/api.md) — every HTTP endpoint with its **response shape** (return-data JSON examples), the response-envelope/error conventions, the locale-prefix convention, and which firewalls authenticate them
- [docs/basilbook.md](./docs/basilbook.md) — BasilBook accounting integration: the `username` vs stable `publicId` identifier model, API token management, and the attendance pull endpoint
- [docs/nextjs-migration-plan.md](./docs/nextjs-migration-plan.md) — why the Next.js port is same-origin and big-bang, the phase plan, and where it actually stands
- [docs/seo-strategy.md](./docs/seo-strategy.md) — keyword targets, page inventory, and the content plan
- [deploy/CUTOVER.md](./deploy/CUTOVER.md) — the runbook for flipping production from the SPA to Next.js (staging subdomain first, then pre-flight, cutover, rollback, bake, decommission)
- [packages/tap-core/SPEC.md](./packages/tap-core/SPEC.md) — wire format for tap credentials, pinned by `AssertionCodecTest` so other-language SDKs can self-check

## Design

Warm cafe aesthetic with glassmorphism. Cream backgrounds (#FAF7F2), coffee brown primary (#6B4226), amber accent (#C17F3B). Serif headings, system sans-serif body.

## License

Proprietary
