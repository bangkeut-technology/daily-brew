# DailyBrew

Staff attendance and leave tracking for restaurants.

## Overview

DailyBrew helps restaurant owners manage their team's daily attendance through QR code check-ins, shift management, and leave request handling.

**Key features:**
- QR code check-in/check-out for staff (auth required via linked user account)
- Late arrival and early departure detection
- Device verification — same device must check in and check out, prevents one phone checking in multiple employees
- Shift and closure management
- Leave request workflow — employees submit (full-day or partial-day with time range), owners approve/reject, employees can cancel pending requests
- Owner dashboard with today's attendance stats
- Manager role — promote trusted employees to approve leave and view all attendance (Espresso: up to 2, Double Espresso: unlimited)
- Employee dashboard with personal attendance, shift, and leave request submission
- IP restriction for check-in locations (with "Use my current IP" helper)
- Geofencing for check-in (GPS radius)
- Dual role system — users can be owners and/or employees across workspaces
- Push notifications via Expo (leave requests, shift changes, closures)
- Email notifications via Mailgun (same events + daily attendance summary for Espresso)
- Per-workspace timezone with auto-detection — works worldwide (Asia, Europe, Americas)
- Multi-language support (English, French, Khmer)
- Dark mode with warm coffee tones

## Plans

| Feature                       | Free     | Espresso ($14.99/mo) | Double Espresso ($39.99/mo) |
|-------------------------------|----------|----------------------|-----------------------------|
| Employees                     | Up to 10 | Up to 20             | Unlimited                   |
| QR check-in                   | Yes      | Yes                  | Yes                         |
| Shifts & closures             | Yes      | Yes                  | Yes                         |
| Dashboard & attendance log    | Yes      | Yes                  | Yes                         |
| Leave requests                | -        | Yes                  | Yes                         |
| Manager role                  | -        | Up to 2              | Unlimited                   |
| IP restriction                | -        | Yes                  | Yes                         |
| Device verification           | -        | Yes                  | Yes                         |
| Geofencing                    | -        | Yes                  | Yes                         |
| Per-day shift schedules       | -        | Yes                  | Yes                         |
| Employee username (BasilBook) | -        | Yes                  | Yes                         |
| Push & email notifications    | -        | Yes                  | Yes                         |
| Daily attendance summary      | -        | Yes                  | Yes                         |
| Priority support              | -        | -                    | Yes                         |

Payments are handled via **Paddle**.

## Tech Stack

### Backend
- PHP 8.4+ / Symfony 8.0
- Doctrine ORM + MySQL
- LexikJWTAuthenticationBundle (JWT auth)
- KnpPaginatorBundle

### Frontend
- React 19 + TypeScript
- Symfony Webpack Encore (Vite-based)
- TanStack Router (file-based routing)
- TanStack Query (server state)
- Tailwind CSS v4
- Radix UI + shadcn/ui components
- clsx + tailwind-merge (`cn()` utility)
- i18next (en, fr, km)
- Lucide React (icons)
- Sonner (toasts)

### Notifications
- Expo Push Notifications (mobile push)
- Symfony Mailer + Mailgun (email)
- Console command for daily summary (`app:send-daily-summary`)

## Getting Started

### Prerequisites
- PHP 8.4+
- Composer
- Node.js 20+
- MySQL 8.0+

### Backend Setup

```bash
# Install dependencies
composer install

# Configure database in .env
# DATABASE_URL="mysql://user:pass@127.0.0.1:3306/dailybrew?serverVersion=8.0.32&charset=utf8mb4"

# Ensure PHP timezone is set to UTC (in php.ini)
# date.timezone = UTC

# Create database and run migrations
php bin/console doctrine:database:create
php bin/console make:migration
php bin/console doctrine:migrations:migrate

# Generate JWT keypair
php bin/console lexik:jwt:generate-keypair

# Start dev server
symfony server:start
# or: php -S localhost:8000 -t public
```

### Frontend Setup

```bash
# Install dependencies
npm ci

# Generate TanStack Router routes
npm run router:generate

# Start dev server
npm run dev

# Build for production
npm run build
```

### Paddle Setup (for paid plans)

1. Create a Paddle account and set up products/prices for Espresso and Double Espresso plans
2. Configure webhook URL: `https://yourdomain.com/api/v1/webhooks/paddle`
3. Set environment variables in `.env.local`:

```env
PADDLE_WEBHOOK_SECRET=your_webhook_secret
PADDLE_API_KEY=your_api_key
PADDLE_PRICE_ID_BREW_PLUS=pri_xxxxx
```

When creating a Paddle checkout, pass the workspace ID in `custom_data`:
```json
{
  "custom_data": {
    "workspace_public_id": "your-workspace-uuid"
  }
}
```

## Reviewer / Demo Accounts

Seed a fully configured demo workspace (Espresso plan) for App Store / Google Play reviewers or live demos:

```bash
php bin/console dailybrew:seed-reviewer         # first run
php bin/console dailybrew:seed-reviewer --fresh  # re-seed (purge + recreate)
```

| Role     | Email                   | Linked to                                            |
|----------|-------------------------|------------------------------------------------------|
| Owner    | reviewer@dailybrew.work | Full dashboard access                                |
| Manager  | manager@dailybrew.work  | Sophea Chan — can approve leave, view all attendance |
| Employee | employee@dailybrew.work | Dara Sok — can view own attendance, submit leave     |

All share the same password: `DailyBrew2026!`

The demo workspace ("The Daily Grind") is pre-configured with the **Espresso plan** and includes:
- 5 employees across 2 shifts (Morning & Evening)
- 1 manager (Sophea Chan)
- 7 days of attendance records with late arrivals, early departures, and absences
- 3 leave requests (approved, pending, rejected)
- 1 upcoming closure (Khmer New Year)

All three accounts can be used to experience the app from each role's perspective — owner, manager, and employee.

## Project Structure

```
src/
  ApiController/          # API controllers
    Auth/                 # Login, register, OAuth
    Workspace/            # Workspace CRUD, settings, dashboard
    Employee/             # Employee CRUD
    Shift/                # Shift CRUD
    Closure/              # Closure CRUD
    Attendance/           # Attendance log
    LeaveRequest/         # Leave request management
    Checkin/              # QR check-in endpoint (auth required)
    Device/               # Push notification device token registration
    Paddle/               # Paddle webhook handler
    Plan/                 # Plan/subscription info
    Dev/                  # Dev-only endpoints (plan toggle)
  Entity/                 # Doctrine entities
  Repository/             # Doctrine repositories
  Service/                # Business logic
  Security/Voter/         # WorkspaceVoter (authorization)
  Enum/                   # Plan, LeaveRequestStatus, SubscriptionStatus
  EventSubscriber/        # Exception handling, rate limiting

assets/src/
  routes/                 # TanStack Router file-based routes
  components/
    dashboard/            # OwnerDashboard, EmployeeDashboard
    layout/               # Sidebar, WorkspaceSwitcher, PageHeader
    shared/               # GlassCard, CustomSelect, CustomDatePicker, etc.
    landing/              # Landing page sections
  hooks/
    queries/              # TanStack Query hooks (useWorkspaces, usePlan, etc.)
  lib/                    # API client (apiAxios), auth, utils (cn)
  types/                  # TypeScript interfaces
  i18n/                   # Translation files (en, fr, km)
```

## API Endpoints

### Auth (public)
- `POST /api/v1/{locale}/auth/login`
- `POST /api/v1/{locale}/auth/register`
- `POST /api/v1/{locale}/auth/google`
- `POST /api/v1/{locale}/auth/apple`

### Workspaces (authenticated)
- `GET/POST /api/v1/{locale}/workspaces`
- `GET/PUT/DELETE /api/v1/{locale}/workspaces/{publicId}`
- `GET/PUT /api/v1/{locale}/workspaces/{publicId}/settings`
- `GET /api/v1/{locale}/workspaces/{publicId}/dashboard`
- `GET /api/v1/{locale}/workspaces/{publicId}/plan`

### Resources (authenticated, scoped to workspace)
- `GET/POST /api/v1/{locale}/workspaces/{publicId}/employees`
- `PUT /api/v1/{locale}/workspaces/{publicId}/employees/{publicId}/role` — promote/demote (owner only)
- `GET/POST /api/v1/{locale}/workspaces/{publicId}/shifts`
- `GET/POST /api/v1/{locale}/workspaces/{publicId}/closures`
- `GET/POST /api/v1/{locale}/workspaces/{publicId}/leave-requests`
- `DELETE /api/v1/{locale}/workspaces/{publicId}/leave-requests/{publicId}` — cancel leave request (employee: own pending only, owner/manager: any)
- `GET /api/v1/{locale}/workspaces/{publicId}/attendances`
- `GET /api/v1/{locale}/workspaces/{publicId}/settings/my-ip` — returns client IP as seen by server

### QR Check-in (authenticated, no locale)
- `GET /api/v1/checkin/{qrToken}`
- `POST /api/v1/checkin/{qrToken}`

### Device Tokens (authenticated, no locale)
- `POST /api/v1/devices` — register push notification token
- `DELETE /api/v1/devices/{token}` — unregister push notification token

### Webhooks (public)
- `POST /api/v1/webhooks/paddle`

## Design

Warm cafe aesthetic with glassmorphism. Cream backgrounds (#FAF7F2), coffee brown primary (#6B4226), amber accent (#C17F3B). Serif headings, system sans-serif body.

## License

Proprietary
