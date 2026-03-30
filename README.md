# DailyBrew

Staff attendance and leave tracking for restaurants.

## Overview

DailyBrew helps restaurant owners manage their team's daily attendance through QR code check-ins, shift management, and leave request handling.

**Key features:**
- QR code check-in/check-out for staff (auth required via linked user account)
- Late arrival and early departure detection
- Device verification — same device must check in and check out, prevents one phone checking in multiple employees
- Shift and closure management
- Leave request workflow — employees submit, owners approve/reject
- Owner dashboard with today's attendance stats
- Employee dashboard with personal attendance, shift, and leave request submission
- IP restriction for check-in locations (with "Use my current IP" helper)
- Geofencing for check-in (GPS radius)
- Dual role system — users can be owners and/or employees across workspaces
- Multi-language support (English, French, Khmer)
- Dark mode with warm coffee tones

## Plans

| Feature | Free | Espresso ($12.99/mo) | Double Espresso ($39.99/mo) |
|---|---|---|---|
| Employees | Up to 10 | Up to 20 | Unlimited |
| QR check-in | Yes | Yes | Yes |
| Shifts & closures | Yes | Yes | Yes |
| Dashboard & attendance log | Yes | Yes | Yes |
| Leave requests | - | Yes | Yes |
| IP restriction | - | Yes | Yes |
| Device verification | - | Yes | Yes |
| Geofencing | - | Yes | Yes |
| Per-day shift schedules | - | Yes | Yes |
| Employee username (BasilBook) | - | Yes | Yes |
| Priority support | - | - | Yes |

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
- `GET/POST /api/v1/{locale}/workspaces/{publicId}/shifts`
- `GET/POST /api/v1/{locale}/workspaces/{publicId}/closures`
- `GET/POST /api/v1/{locale}/workspaces/{publicId}/leave-requests`
- `GET /api/v1/{locale}/workspaces/{publicId}/attendances`
- `GET /api/v1/{locale}/workspaces/{publicId}/settings/my-ip` — returns client IP as seen by server

### QR Check-in (authenticated)
- `GET /api/v1/checkin/{qrToken}`
- `POST /api/v1/checkin/{qrToken}`

### Webhooks (public)
- `POST /api/v1/webhooks/paddle`

## Design

Warm cafe aesthetic with glassmorphism. Cream backgrounds (#FAF7F2), coffee brown primary (#6B4226), amber accent (#C17F3B). Serif headings, system sans-serif body.

## License

Proprietary
