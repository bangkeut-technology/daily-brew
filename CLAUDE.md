# CLAUDE.md — DailyBrew

Staff attendance and leave tracking for restaurants.
Symfony backend + React frontend (Symfony Webpack Encore).

---

## What this product does

- Restaurant owners sign up, create a Workspace (their restaurant)
- Owner creates Employees and assigns them a Shift
- Each Employee gets a unique QR code
- Staff scan the QR code on their phone → mobile web page opens → tap Check In
- Attendance is recorded and compared against their Shift to detect late arrivals and early departures
- Staff submit Leave Requests via mobile web page; owner approves or rejects from dashboard
- Owner defines Closures (date ranges when restaurant is closed) — no attendance expected during these periods

---

## What this product does NOT do

- No KPI / evaluation / scoring
- No payroll, payslips, or salary management
- No LinkedIn OAuth

Any request to add the above should be deferred to a future milestone.

### Espresso Plan ($12.99/month)
Premium features gated behind Espresso subscription:
- Unlimited employees (free = 5 max)
- IP restriction for check-in
- Device verification for check-in (same device for in/out, prevent double check-in)
- Geofencing for check-in (lat/lng + radius)
- Per-day shift schedules (ShiftTimeRule per day-of-week)
- Leave request management
- Priority support

### Dark Roast Plan (future roadmap — do NOT build)
- Multiple QR codes per workspace (e.g. front door, kitchen, bar)
- Per-QR geofence & WiFi rules
- Employee assignment per QR code
- Manager role (elevated Employee — can view team attendance & approve leave)
- Trusted devices per employee (whitelist specific devices that can check in/out)
- White-label branding (custom logo, colors, app name per workspace)

### Dual Role System
Users can be owners (create workspaces) or employees (linked to an employee record).
- After sign-up, users go through an onboarding wizard to choose their role.
- Owner view: full dashboard, employee management, shift/closure/settings pages
- Employee view: personal dashboard, own attendance, own leave requests
- A user can be both owner and employee in different workspaces.

---

## Data Model

### Entities

**User**
- id, publicId (UUID)
- email, password (nullable for OAuth)
- googleId (nullable), appleId (nullable)
- createdAt, updatedAt
- Role: ROLE_USER (all authenticated users)

**Workspace**
- id, publicId
- name (restaurant name)
- ownerId → User (ManyToOne)
- createdAt, updatedAt

**WorkspaceSetting**
- id
- workspaceId → Workspace (OneToOne)
- ipRestrictionEnabled (boolean, default false)
- allowedIps (array, nullable) — IPs allowed to scan QR codes
- deviceVerificationEnabled (boolean, default false) — Espresso only
- timezone (string, default "Asia/Phnom_Penh")
- locale (string, default "en")

**Shift**
- id, publicId
- workspaceId → Workspace (ManyToOne)
- name (e.g. "Morning", "Evening")
- startTime (time)
- endTime (time)
- createdAt, updatedAt

**Closure**
- id, publicId
- workspaceId → Workspace (ManyToOne)
- name (e.g. "Khmer New Year", "Renovation")
- startDate (date)
- endDate (date)
- createdAt

**Employee**
- id, publicId
- workspaceId → Workspace (ManyToOne)
- userId → User (OneToOne, nullable) — unique constraint on userId
- shiftId → Shift (ManyToOne, nullable)
- name
- phone (nullable)
- qrToken (string, unique) — used in QR code URL
- active (boolean, default true)
- createdAt, updatedAt

**Attendance**
- id, publicId
- employeeId → Employee (ManyToOne)
- date (date)
- checkInAt (datetime, nullable)
- checkOutAt (datetime, nullable)
- isLate (boolean, computed on check-in vs Shift.startTime)
- leftEarly (boolean, computed on check-out vs Shift.endTime)
- ipAddress (string, nullable — recorded for audit)
- checkInDeviceId (string 36, nullable) — browser UUID for device verification
- checkInDeviceName (string 255, nullable) — parsed user agent
- checkOutDeviceId (string 36, nullable) — audit trail
- checkOutDeviceName (string 255, nullable) — audit trail
- createdAt, updatedAt
- Unique constraint: (employeeId, date)

**LeaveRequest**
- id, publicId
- employeeId → Employee (ManyToOne)
- date (date)
- reason (text, nullable)
- status (enum: pending, approved, rejected, default pending)
- reviewedAt (datetime, nullable)
- createdAt, updatedAt

---

## Key Business Rules

### Closure logic
Before creating any attendance record, check if the date falls within any Closure for the workspace. If yes, skip entirely.

### Late / left early detection
Computed at check-in/out time relative to the Employee's assigned Shift + grace minutes. If no Shift, always false.

### QR check-in IP restriction
On check-in via QR:
1. If `WorkspaceSetting.ipRestrictionEnabled` is false → allow
2. If enabled and `allowedIps` is empty → allow (misconfiguration fallback)
3. If enabled → check request IP against `allowedIps` → reject with 403 if not matched

### Device verification (Espresso)
Prevents fraud by binding check-in/out to a single device per employee per day.
Frontend generates a UUID stored in `localStorage` (`dailybrew_device_id`) and sends it + parsed device name with every check-in/out POST.

On check-in via QR:
1. If `WorkspaceSetting.deviceVerificationEnabled` is false → skip device checks
2. If enabled → check if any *other* employee in the same workspace already checked in today with the same device ID → reject with 403
3. Store `checkInDeviceId` and `checkInDeviceName` on the Attendance record

On check-out via QR:
1. If enabled AND `checkInDeviceId` is set AND incoming `deviceId !== checkInDeviceId` → reject with 403 ("must use same device")
2. Always store `checkOutDeviceId` and `checkOutDeviceName` for audit

### User ↔ Employee (1:1)
- A User can be linked to at most one Employee (`unique` constraint on `employee.user_id`)
- An Employee can exist without a User (QR-only staff)
- Linking is done by the owner from the employee detail page

### Attendance uniqueness
One Attendance record per Employee per day. Attempting a second check-in on the same day returns the existing record.

---

## Authentication

JWT via LexikJWTAuthenticationBundle. Flows: email+password, Google OAuth, Apple OAuth — all return JWT. QR-scanning staff do NOT authenticate (tokenized URL only).

## QR Check-in Flow

QR encodes `https://dailybrew.work/checkin/{qrToken}`. Staff scans → mobile web page → Check In/Out button. POST `/api/v1/checkin/{qrToken}` validates IP, device, geofence if enabled → creates/updates Attendance record. Public route, no auth.

---

## Backend Architecture

Symfony 7 + Doctrine ORM + LexikJWTAuthenticationBundle + KnpPaginatorBundle.

- API prefix: `/api/v1/{_locale}` (en, fr, km) — except Checkin routes which use `/api/v1/checkin/` (no locale)
- Controller + Trait pattern, business logic in `src/Service/`
- Multi-tenancy: Workspace is root aggregate, WorkspaceVoter handles authorization

---

## Frontend Architecture

React 19 + TypeScript, TanStack Router (file-based) + TanStack Query, shadcn/ui + Radix, Tailwind CSS v4, Zod + React Hook Form, Axios, i18next (en/fr/km), Lucide React icons, Sonner toasts.

Routes: `/sign-in`, `/sign-up`, `/auth/callback`, `/checkin/:qrToken` (public), `/console/*` (auth guard) with dashboard, employees, attendance, leave, shifts, closures, settings, profile.

### Check-in mobile page
Public route `/checkin/:qrToken` — no sidebar, no auth. Shows employee name, shift, status, and a single Check In / Check Out button. Handles errors: IP restriction, device mismatch, device already used, geofence, invalid token.

---

## Commands

```bash
# Backend
composer install
php bin/console doctrine:migrations:migrate
php bin/console lexik:jwt:generate-keypair

# Frontend
npm ci
npm run router:generate
npm run dev
```

---

## Frontend Style Guide

Warm cafe aesthetic with glassmorphism. Refer to existing components in `assets/src/components/shared/` for implementation patterns (GlassCard, StatusBadge, Avatar, etc.).

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| cream | `#FAF7F2` | Page background |
| cream-2 | `#F3EDE3` | Sidebar background |
| cream-3 | `#EBE2D6` | Dividers, hover states, borders |
| coffee | `#6B4226` | Primary action, logo, active nav |
| coffee-light | `#9B6B45` | Primary hover |
| amber | `#C17F3B` | Accent, badges, nav dot |
| amber-light | `#E8A85A` | Gradients |
| text-primary | `#2C2420` | Headings, names |
| text-secondary | `#7C6860` | Subtitles, meta |
| text-tertiary | `#AE9D95` | Hints, timestamps |
| green | `#4A7C59` | Present, on time, approved |
| red | `#C0392B` | Absent, rejected |
| blue | `#3B6FA0` | Info, evening shift |
| glass-bg | `rgba(255,255,255,0.62)` | Card backgrounds |
| glass-border | `rgba(255,255,255,0.85)` | Card borders |

### Typography

- **Headings**: Palatino/Georgia serif, 24px/600
- **Body/UI**: System sans-serif, 13–14px/400–500
- **Timestamps**: SF Mono/monospace, tabular-nums

### Key Patterns

- **Glass cards**: `bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl` with hover lift (`hover:-translate-y-0.5`)
- **Stat cards**: Glass card + colored top accent bar (`h-0.5`) — green/amber/blue/red per type
- **Buttons**: Primary `bg-coffee text-white`, Secondary `bg-white/62 border-cream-3`
- **Badges**: `text-[10.5px] px-2 py-0.5 rounded-full` with variant colors (green/amber/red/blue/gray at 10% opacity bg)
- **Avatars**: Deterministic gradient from name index, initials, never photos. Sizes: 32px (rows), 42px (cards), 64px (QR page)
- **Page transitions**: Fade in + slide up (`translateY(6px)` → 0, 0.25s ease)
- **Empty states**: Dashed border card with centered "+" prompt
- **Body background**: Three-layer radial gradient on `body::before` (amber/coffee/amber-light, low opacity)

### Error States (check-in page)

- IP restricted / device mismatch / device already used: warm amber warning card, no button
- Already checked out: completed state, no button
- Invalid token: 404-style message

### Do / Don't

| Do | Don't |
|---|---|
| Cream backgrounds (#FAF7F2) | Pure white backgrounds |
| Glass cards with `backdrop-blur` | Flat opaque cards |
| Serif for page titles | Inter or Roboto |
| Deterministic avatar gradients | User photos or generic icons |
| Amber accent for interactive elements | Blue as primary accent |
| `hover:-translate-y-px` lift on cards | Box-shadow only (no lift) |
| Sentence case everywhere | Title Case on labels |
| Tabular nums for timestamps | Default font for numbers |
| Warm status colors (green/amber/red) | Gray-only status indicators |

---

## Out of scope (do not build unless explicitly asked)

- ShiftTimeRule (per-day-of-week shift hours)
- Payroll / payslip generation
- KPI / evaluation / scoring
- Team members / manager roles (only owner role for now)
- Employee mobile app (Expo) — check-in is mobile web only
- Push notifications
- Export to CSV/Excel
- Demo mode
