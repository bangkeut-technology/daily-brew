# CLAUDE.md — DailyBrew

Staff attendance and leave tracking for restaurants.
Symfony backend + React frontend (Symfony Webpack Encore).

---

## What this product does

- Restaurant owners sign up, create a Workspace (their restaurant)
- Owner creates Employees and assigns them a Shift
- Each Employee gets a unique QR code (separate `qrToken`, not the `publicId`)
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
- Employee username for BasilBook staff linking
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
- currentWorkspace → Workspace (ManyToOne, nullable) — persisted for cross-device workspace restore
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
- dateFormat (string, default "DD/MM/YYYY") — DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD
- geofencingEnabled (boolean, default false)
- geofencingLatitude (float, nullable)
- geofencingLongitude (float, nullable)
- geofencingRadiusMeters (int, nullable, default 100)

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
- user → User (ManyToOne, not null) — the workspace owner who created this employee
- linkedUser → User (ManyToOne, nullable) — allows employee to log in and see own data
- Unique constraint: (linkedUser, workspace) — one user per employee per workspace, but can be linked across workspaces
- shiftId → Shift (ManyToOne, nullable)
- firstName, lastName
- username (string 50, nullable, unique) — for BasilBook staff linking (Espresso only)
- phoneNumber (nullable)
- dob (date, nullable) — date of birth
- joinedAt (date, nullable) — join date
- qrToken (string 24, unique) — used exclusively in QR code check-in URL (NOT publicId)
- status (enum: active/inactive, default active)
- deletedAt (datetime, nullable) — soft delete
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

### QR check-in — separate token from publicId
- `qrToken` is a 20-char random string generated on employee creation
- QR encodes `https://dailybrew.work/checkin/{qrToken}`
- `publicId` is used only for account linking and API references — NEVER in QR URLs
- This prevents someone who receives a publicId for linking from using it to check in

### QR check-in IP restriction
On check-in via QR:
1. If `WorkspaceSetting.ipRestrictionEnabled` is false → allow
2. If enabled and `allowedIps` is empty → allow (misconfiguration fallback)
3. If enabled → check request IP against `allowedIps` → reject with 403 if not matched

### QR check-in auth for linked users
If an employee has a `linkedUser`:
1. The check-in page requires the linked user to be signed in
2. Shows "Sign in required" with a sign-in button if not authenticated
3. Shows "Verified account" badge when the correct user is signed in
4. Unlinked employees (QR-only staff) keep the fully public check-in flow

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

### User ↔ Employee linking (ManyToOne)
- A User can be linked to **multiple** Employees across different workspaces (e.g., staff working part-time at two restaurants)
- A User can only be linked to **one** Employee per workspace (composite unique on `linkedUser + workspace`)
- An Employee can exist without a linked User (QR-only staff)
- Linking can be done by:
  - Owner entering the user's public ID on the employee detail page
  - Owner entering the user's public ID during employee creation
  - Employee entering their employee public ID during onboarding
- Unlinking is available from the employee detail page (with confirmation modal)
- Role context returns `linkedWorkspaces[]` — all workspaces where the user is an employee

### Employee duplication prevention
- Backend checks for existing employee with same firstName + lastName in the workspace before creation
- Returns 409 if duplicate found
- All employee list queries filter out soft-deleted records (`deletedAt IS NULL`)

### Employee username (Espresso)
- Optional unique identifier for cross-product staff linking with BasilBook
- Must match the staff name or ID used in the POS system
- Only available on Espresso plan

### Attendance uniqueness
One Attendance record per Employee per day. Attempting a second check-in on the same day returns the existing record.

### Workspace persistence
- `currentWorkspace` is stored on the User entity (server-side)
- Also cached in `localStorage` for fast access
- On workspace switch, both localStorage and server are updated
- On sign-in to a new device, workspace is restored from server if localStorage is empty

---

## Authentication

JWT via LexikJWTAuthenticationBundle. Flows: email+password, Google OAuth, Apple OAuth — all return JWT. QR-scanning staff do NOT authenticate (tokenized URL only) unless they have a linked user account.

## QR Check-in Flow

QR encodes `https://dailybrew.work/checkin/{qrToken}`. Staff scans → mobile web page → Check In/Out button. POST `/api/v1/checkin/{qrToken}` validates IP, device, geofence if enabled → creates/updates Attendance record. Public route for unlinked employees; requires auth for linked employees.

---

## Backend Architecture

Symfony 7 + Doctrine ORM + LexikJWTAuthenticationBundle + KnpPaginatorBundle.

- API prefix: `/api/v1/{_locale}` (en, fr, km) — except Checkin routes which use `/api/v1/checkin/` (no locale)
- Controller + Trait pattern, business logic in `src/Service/`
- Multi-tenancy: Workspace is root aggregate, WorkspaceVoter handles authorization

---

## Frontend Architecture

React 19 + TypeScript, TanStack Router (file-based) + TanStack Query, shadcn/ui + Radix, Tailwind CSS v4, Zod + React Hook Form, Axios, i18next (en/fr/km), Lucide React icons, Sonner toasts.

Routes: `/sign-in`, `/sign-up`, `/auth/callback`, `/checkin/:qrToken` (public/auth), `/console/*` (auth guard) with dashboard, employees, attendance, leave, shifts, closures, settings, profile.

### Custom UI Components (assets/src/components/shared/)
- **GlassCard** / **GlassCardHeader** — glass-morphism card with optional hover lift
- **CustomSelect** — dropdown with auto-search for 8+ options, check marks, glass design
- **CustomDatePicker** — calendar grid with month navigation, today highlight
- **CustomTimePicker** — hour/minute spinners with 5-min step
- **Toggle** — pill switch with check/X icon indicator (replaces all checkboxes)
- **ConfirmModal** — Radix dialog with danger/default variants
- **Avatar** — deterministic gradient from name, initials
- **StatusBadge** — colored pill badge (green/amber/red/gray/blue)
- **StatCard** — glass card with colored accent bar
- **EmptyState** — dashed border card with "+" prompt

### Check-in mobile page
Route `/checkin/:qrToken`:
- **Unlinked employee**: fully public, no auth required
- **Linked employee**: requires the linked user to be signed in, shows "Sign in required" if not
- Shows employee name, shift, status, and a single Check In / Check Out button
- Handles errors: IP restriction, device mismatch, device already used, geofence, invalid token, auth required

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

Warm cafe aesthetic with glassmorphism. Dark mode supported with warm coffee tones. Refer to existing components in `assets/src/components/shared/` for implementation patterns.

### Color Palette

| Token | Hex (light) | Dark mode | Usage |
|---|---|---|---|
| cream | `#FAF7F2` | `#1E1916` | Page background |
| cream-2 | `#F3EDE3` | `#262019` | Sidebar background |
| cream-3 | `#EBE2D6` | `#332B24` | Dividers, hover states, borders |
| coffee | `#6B4226` | `#E8A85A` | Primary action, logo, active nav |
| coffee-light | `#9B6B45` | `#D49A4E` | Primary hover |
| amber | `#C17F3B` | `#E8A85A` | Accent, badges, nav dot |
| amber-light | `#E8A85A` | `#D49A4E` | Gradients |
| text-primary | `#2C2420` | `#F0EAE2` | Headings, names |
| text-secondary | `#7C6860` | `#B0A498` | Subtitles, meta |
| text-tertiary | `#AE9D95` | `#7A6E64` | Hints, timestamps |
| green | `#4A7C59` | `#6BB87A` | Present, on time, approved |
| red | `#C0392B` | `#E05A4E` | Absent, rejected |
| blue | `#3B6FA0` | `#5A9AD6` | Info, evening shift |
| glass-bg | `rgba(255,255,255,0.62)` | `rgba(50,42,34,0.72)` | Card backgrounds |
| glass-border | `rgba(255,255,255,0.85)` | `rgba(90,78,62,0.45)` | Card borders |

### Typography

- **Headings**: Palatino/Georgia serif, 24px/600
- **Body/UI**: System sans-serif, 13–14px/400–500
- **Timestamps**: SF Mono/monospace, tabular-nums

### Key Patterns

- **Glass cards**: `bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl` with hover lift
- **Stat cards**: Glass card + colored top accent bar (`h-1 bg-gradient-to-r`) — green/amber/blue/red per type
- **Buttons**: Primary `bg-coffee text-white`, Secondary `bg-glass-bg border border-cream-3`
- **Badges**: `text-[10.5px] px-2 py-0.5 rounded-full` with variant colors (green/amber/red/blue/gray at 10% opacity bg)
- **Toggles**: Pill switch with check/X icon — `bg-coffee` when on, `bg-cream-3` when off (never use native checkboxes)
- **Selects**: CustomSelect component — never use native `<select>` elements
- **Date inputs**: CustomDatePicker — never use native `<input type="date">`
- **Time inputs**: CustomTimePicker — never use native `<input type="time">`
- **Confirmations**: ConfirmModal component — never use native `confirm()`, `alert()`, or `prompt()`
- **Avatars**: Deterministic gradient from name index, initials, never photos. Sizes: 32px (rows), 42px (cards), 64px (QR page)
- **Page transitions**: Fade in + slide up (`translateY(6px)` → 0, 0.25s ease)
- **Empty states**: Dashed border card with `bg-glass-bg backdrop-blur-md` — never `bg-white/30`
- **Body background**: Three-layer radial gradient on `body::before` (amber/coffee/amber-light, higher opacity in dark mode)
- **Form fields**: Must have `id` and `name` attributes; `<label>` must have `htmlFor` pointing to the input `id`
- **Action buttons** (edit, delete): Always visible — never hidden behind hover (`opacity-0 group-hover:opacity-100`)

### Error States (check-in page)

- IP restricted / device mismatch / device already used: warm amber warning card, no button
- Auth required (linked user): amber card with sign-in button
- Already checked out: completed state with green card, no button
- Invalid token: 404-style red message

### Do / Don't

| Do | Don't |
|---|---|
| Cream backgrounds (#FAF7F2) | Pure white backgrounds |
| Glass cards with `backdrop-blur` | Flat opaque cards |
| `bg-glass-bg` for translucent backgrounds | Hardcoded `bg-white/30` or `bg-white/40` |
| CustomSelect, CustomDatePicker, CustomTimePicker | Native `<select>`, `<input type="date">`, `<input type="time">` |
| Toggle component with check/X indicator | Native checkboxes |
| ConfirmModal for destructive actions | Native `confirm()` dialogs |
| Serif for page titles | Inter or Roboto |
| Deterministic avatar gradients | User photos or generic icons |
| Amber accent for interactive elements | Blue as primary accent |
| `hover:-translate-y-px` lift on cards | Box-shadow only (no lift) |
| Sentence case everywhere | Title Case on labels |
| Tabular nums for timestamps | Default font for numbers |
| Warm status colors (green/amber/red) | Gray-only status indicators |
| Always-visible edit/delete buttons | Hover-only action buttons |
| `id` + `name` on all form inputs | Inputs without id/name attributes |
| `htmlFor` on labels | Labels without for attribute |

---

## BasilBook Integration

DailyBrew employees can be linked to BasilBook staff records via the `username` field (Espresso plan required). This enables cross-product insights — matching attendance data with POS sales data. The username must match the staff name or ID used in BasilBook/POS system.

---

## Out of scope (do not build unless explicitly asked)

- Payroll / payslip generation
- KPI / evaluation / scoring
- Team members / manager roles (only owner role for now)
- Employee mobile app (Expo) — check-in is mobile web only
- Push notifications
- Export to CSV/Excel
- Demo mode
