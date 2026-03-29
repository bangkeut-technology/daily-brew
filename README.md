# DailyBrew

Staff attendance and leave tracking for restaurants.

## Overview

DailyBrew helps restaurant owners manage their team's daily attendance through QR code check-ins, shift management, and leave request handling.

**Key features:**
- QR code check-in/check-out for staff (no account needed)
- Late arrival and early departure detection
- Device verification — same device must check in and check out, prevents one phone checking in multiple employees
- Shift and closure management
- Leave request workflow (approve/reject)
- Dashboard with today's attendance stats
- IP restriction for check-in locations
- Geofencing for check-in (GPS radius)
- Multi-language support (English, French, Khmer)

## Plans

| Feature | Free | Espresso |
|---|---|---|
| Employees | Up to 5 | Unlimited |
| QR check-in | Yes | Yes |
| Shifts & closures | Yes | Yes |
| Dashboard & attendance log | Yes | Yes |
| Leave requests | - | Yes |
| IP restriction | - | Yes |
| Device verification | - | Yes |
| Geofencing | - | Yes |
| Per-day shift schedules | - | Yes |

Payments are handled via **Paddle**.

## Tech Stack

### Backend
- PHP 8.4+ / Symfony 8.0
- Doctrine ORM + MySQL
- LexikJWTAuthenticationBundle (JWT auth)
- KnpPaginatorBundle

### Frontend
- React 19 + TypeScript
- Vite
- TanStack Router (file-based routing)
- TanStack Query (server state)
- Tailwind CSS v4
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
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api to localhost:8000)
npm run dev

# Build for production
npm run build
```

### Paddle Setup (for Brew+ subscriptions)

1. Create a Paddle account and set up a product/price for Brew+
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
    Checkin/              # Public QR check-in endpoint
    Paddle/               # Paddle webhook handler
    Plan/                 # Plan/subscription info
  Entity/                 # Doctrine entities
  Repository/             # Doctrine repositories
  Service/                # Business logic
  Security/Voter/         # WorkspaceVoter (authorization)
  Enum/                   # Plan, LeaveRequestStatus, SubscriptionStatus

frontend/
  src/
    routes/               # TanStack Router file-based routes
    components/           # React components
    hooks/                # Custom hooks + query hooks
    lib/                  # API client, auth, i18n
    types/                # TypeScript interfaces
    i18n/                 # Translation files
```

## API Endpoints

### Auth (public)
- `POST /api/v1/{locale}/auth/login`
- `POST /api/v1/{locale}/auth/register`
- `POST /api/v1/{locale}/auth/google`
- `POST /api/v1/{locale}/auth/apple`

### Workspaces (authenticated)
- `GET/POST /api/v1/{locale}/workspaces`
- `GET/PUT/DELETE /api/v1/{locale}/workspaces/{id}`
- `GET/PUT /api/v1/{locale}/workspaces/{id}/settings`
- `GET /api/v1/{locale}/workspaces/{id}/dashboard`
- `GET /api/v1/{locale}/workspaces/{id}/plan`

### Resources (authenticated, scoped to workspace)
- `GET/POST /api/v1/{locale}/workspaces/{id}/employees`
- `GET/POST /api/v1/{locale}/workspaces/{id}/shifts`
- `GET/POST /api/v1/{locale}/workspaces/{id}/closures`
- `GET/POST /api/v1/{locale}/workspaces/{id}/leave-requests`
- `GET /api/v1/{locale}/workspaces/{id}/attendances`

### QR Check-in (public)
- `GET /api/v1/checkin/{qrToken}`
- `POST /api/v1/checkin/{qrToken}`

### Webhooks (public)
- `POST /api/v1/webhooks/paddle`

## Design

Warm cafe aesthetic with glassmorphism. Cream backgrounds (#FAF7F2), coffee brown primary (#6B4226), amber accent (#C17F3B). Serif headings, system sans-serif body.

## License

Proprietary
