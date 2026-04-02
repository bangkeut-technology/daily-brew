# CLAUDE.md — DailyBrew

Staff attendance and leave tracking for restaurants.
Symfony backend + React frontend (Symfony Webpack Encore).

---

## What this product does

- Restaurant owners sign up, create a Workspace (their restaurant)
- Owner creates Employees and assigns them a Shift
- Each Workspace has a single QR code displayed at the restaurant
- Employees sign in on their phone and scan the workspace QR → check in/out recorded
- Attendance is recorded and compared against their Shift to detect late arrivals and early departures
- Staff submit Leave Requests via mobile web page; owner approves or rejects from dashboard
- Owner defines Closures (date ranges when restaurant is closed) — no attendance expected during these periods

---

## What this product does NOT do

- No KPI / evaluation / scoring
- No payroll, payslips, or salary management
- No LinkedIn OAuth

Any request to add the above should be deferred to a future milestone.

### Espresso Plan ($14.99/month · $149/year)
- Up to 20 employees (free = 10 max)
- IP restriction for check-in
- Device verification for check-in (same device for in/out, prevent double check-in)
- Geofencing for check-in (lat/lng + radius)
- Per-day shift schedules (ShiftTimeRule per day-of-week)
- Leave request management
- Employee username for BasilBook staff linking
- Manager role (up to 2 per workspace) — can approve/reject leave, view all attendance
- Push notifications (Expo) for leave requests, shift changes, closures
- Email notifications (Mailgun) for all events
- Daily attendance summary notification (push + email)

### Double Espresso Plan ($39.99/month · $399/year)
- Unlimited employees
- Everything in Espresso
- Unlimited managers
- Priority support
- Future: Multiple QR codes per workspace, white-label branding

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
- qrToken (string 24, unique) — used in check-in QR code URL (one QR per workspace)
- ownerId → User (ManyToOne)
- createdAt, updatedAt

**WorkspaceSetting**
- id
- workspaceId → Workspace (OneToOne)
- ipRestrictionEnabled (boolean, default false)
- allowedIps (array, nullable) — IPs allowed to scan QR codes
- deviceVerificationEnabled (boolean, default false) — Espresso only
- timezone (string, default "Asia/Phnom_Penh") — auto-detected from browser on workspace creation
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
- role (enum: employee/manager, default employee) — workspace-level role
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
- startDate (date)
- endDate (date)
- startTime (time, nullable) — partial-day leave start; `null` = full day
- endTime (time, nullable) — partial-day leave end; `null` = full day
- reason (text, nullable)
- type (enum: paid, unpaid)
- status (enum: pending, approved, rejected, default pending)
- reviewedAt (datetime, nullable)
- createdAt, updatedAt
- Helper: `isFullDay()` — returns true when both startTime and endTime are null

**DeviceToken**
- id, publicId
- token (string 255, unique) — Expo push token
- platform (string 20) — ios, android, or web
- user → User (ManyToOne, not null, CASCADE delete)
- createdAt, updatedAt

**ApiToken**
- id, publicId
- prefix (string 8) — first 8 chars of raw token, for UI display
- tokenHash (string 64, unique) — SHA-256 hash; plain token never stored
- name (string 100) — human-readable label (e.g. "BasilBook production")
- workspace → Workspace (ManyToOne, CASCADE delete)
- lastUsedAt (datetime, nullable) — updated on each authenticated request
- revokedAt (datetime, nullable) — null = active
- createdAt

---

## Key Business Rules

### Closure logic
Before creating any attendance record, check if the date falls within any Closure for the workspace. If yes, skip entirely.

### Leave request validation
`LeaveRequestService::create()` enforces:
- `startDate <= endDate`
- No overlap with closure periods (uses `ClosurePeriodRepository::findOverlappingClosure()`)
- No duplicate pending/approved leaves for same dates (uses `LeaveRequestRepository::findOverlappingForEmployee()`)
- Accepts optional `startTime`/`endTime` for partial-day leave (`null` = full day)

### Leave request authorization
- CREATE uses `WorkspaceVoter::VIEW` (not EDIT) so employees can submit their own requests. Backend enforces employees can only submit for themselves.
- DELETE `DELETE /workspaces/{publicId}/leave-requests/{publicId}` — employees can cancel own pending requests, owners can cancel any.

### Leave blocks check-in
CheckinService blocks check-in for employees with an approved full-day leave for the current date. Checkin status API returns `onLeave` (boolean) and `leaveIsFullDay` (boolean) fields.

### Late / left early detection
Computed at check-in/out time relative to the Employee's assigned Shift + grace minutes. If no Shift, always false. All time comparisons use the workspace timezone from `WorkspaceSetting.timezone`.

### Timezone handling
- **Server PHP timezone**: must be set to `UTC` (`date.timezone = UTC` in php.ini)
- **Workspace timezone**: stored per-workspace in `WorkspaceSetting.timezone` (IANA format, e.g. `Asia/Phnom_Penh`, `Europe/Paris`)
- **Auto-detection**: on workspace creation, the browser's `Intl.DateTimeFormat().resolvedOptions().timeZone` is sent and validated against `DateTimeZone::listIdentifiers()`
- **Settings page**: timezone selector uses `Intl.supportedValuesOf('timeZone')` to list all IANA timezones dynamically, sorted by UTC offset, with DST-aware offset labels

#### DateService (`src/Service/DateService.php`)
**Every `DateTime` / `DateTimeImmutable` in the codebase MUST go through `DateService`.** Never write `new \DateTime()` or `new \DateTimeImmutable()` directly.

| Method | Returns | Use for |
|---|---|---|
| `DateService::now()` | `DateTimeImmutable` (UTC) | Timestamps: createdAt, reviewedAt, canceledAt, deletedAt |
| `DateService::today($tz)` | `DateTimeImmutable` (midnight in `$tz`) | Date-based lookups: "today's attendance", closure checks |
| `DateService::relative('+1 hour')` | `DateTimeImmutable` (UTC) | Expiry times, relative dates |
| `DateService::parse('2026-04-01')` | `DateTimeImmutable` (UTC) | User-supplied date strings |
| `DateService::createFromFormat($fmt, $val, $tz?)` | `DateTimeImmutable` | Shift time parsing, custom formats |
| `DateService::toUtc($dt)` | `DateTimeImmutable` (UTC) | Convert workspace-local to UTC for storage |
| `DateService::mutableNow()` | `DateTime` (UTC) | Doctrine `datetime` columns |
| `DateService::mutableRelative($expr)` | `DateTime` (UTC) | Doctrine `datetime` columns with offset |
| `DateService::mutableParse($val)` | `DateTime` (UTC) | Doctrine `datetime` columns from strings |
| `DateService::utc()` | `DateTimeZone` | Shared UTC timezone instance |

#### Backend rules
- **Storage**: all `datetime` / `datetime_immutable` columns store UTC
- **Date columns**: `date` / `date_immutable` store the workspace-local calendar date (set via `DateService::today($wsTz)`)
- **Display**: `AttendanceDTO::fromEntity()` and `AttendanceController` convert UTC → workspace TZ using `setTimezone($tz)` before formatting
- **Late/early detection**: `CheckinService` uses `DateService::now()` for storage, converts to workspace TZ for time comparisons
- **Seeder**: forces `date_default_timezone_set('UTC')` at start, uses `DateService` for all dates, converts attendance times from workspace TZ to UTC via `->setTimezone($utc)`

#### Frontend timezone utilities
- **`lib/timezone.ts`**: `todayInTimezone(tz)`, `parseDateAsUTC(dateStr)`, `formatDateUTC(date)`, `nowInTimezone(tz)`, `startOfMonthInTimezone(tz)`
- **`hooks/useWorkspaceTimezone.ts`**: returns `{ timezone, today(), startOfMonth(), todayMidnight(), parseDate() }` — all workspace-TZ-aware
- **`lib/dateFormat.ts`**: `formatDate()` uses UTC getters for YYYY-MM-DD strings to prevent browser-TZ day shift
- **Rule**: never use `new Date().toISOString().split('T')[0]` for "today" — use `wsTz.today()` instead
- **Rule**: never use `new Date(dateStr)` for YYYY-MM-DD strings — use `parseDateAsUTC(dateStr)` to prevent day shift
- **Rule**: all date comparisons (closures, leaves, attendance ranges) must use `parseDateAsUTC()` on both sides
- **CustomDatePicker**: accepts optional `todayOverride` prop for workspace-TZ-aware "today" highlight

### Workspace deletion
- `WorkspaceService::delete()` cancels active Paddle subscription via API before soft-deleting
- `AccountDeletionService::softDelete()` delegates to `WorkspaceService::delete()` for each owned workspace
- Subscription is marked as `Canceled` with `canceledAt` timestamp locally, regardless of Paddle API response
- Paddle API failure does not block workspace deletion (logged and swallowed)

### QR check-in — workspace-level QR code
- Each workspace has a `qrToken` (20-char random string) generated on creation
- QR encodes `dailybrew:ws:{qrToken}` — NOT a URL, just data for the mobile app
- ONE QR code per workspace — displayed at the restaurant entrance
- Employee opens DailyBrew mobile app → scans QR → app extracts token → calls `POST /api/v1/checkin/{qrToken}`
- Employee must be signed in to check in — system resolves employee from auth session + workspace
- All employees need a linked user account to check in
- Web route `/checkin/{qrToken}` exists as a fallback for testing only

### QR check-in IP restriction
On check-in via QR:
1. If `WorkspaceSetting.ipRestrictionEnabled` is false → allow
2. If enabled and `allowedIps` is empty → allow (misconfiguration fallback)
3. If enabled → check request IP against `allowedIps` → reject with 403 if not matched

Settings page has a "Use my current IP" button that calls `GET /workspaces/{publicId}/settings/my-ip` to fetch the client IP as seen by the server, then appends it to the allowed IPs list.

### QR check-in auth (always required)
1. Employee scans workspace QR → opens check-in page
2. If not signed in → shows "Sign in required" with sign-in button
3. If signed in → backend resolves employee from user + workspace
4. If no employee record found → 403 "You are not registered as an employee in this workspace"
5. If found → shows check-in/out button with "Verified" badge

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

### Manager role (Espresso)
- Employee can be promoted to manager by the workspace owner from the employee detail page
- Managers must have a linked user account
- Espresso plan: up to 2 managers per workspace; Double Espresso: unlimited
- Manager can: view all attendance, approve/reject leave requests, view all leave requests, cancel leave requests
- Manager cannot: add/edit/delete employees, manage shifts/closures/settings, manage billing, promote other managers
- WorkspaceVoter `MANAGE` attribute grants manager-level access (owner + manager)
- `EDIT` and `DELETE` remain owner-only

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

### Notifications (Espresso)
Push (Expo) and email (Mailgun) notifications are sent for the following events:
- **Leave request submitted** → notify workspace owner
- **Leave request approved/rejected** → notify employee (linked user)
- **Shift assigned/changed** → notify employee (linked user)
- **Closure created** → notify all linked employees in workspace
- **Daily attendance summary** → notify workspace owner (via `app:send-daily-summary` cron command)

All notifications include a `data` payload with `type` and `workspacePublicId` for mobile deep linking.

### Device token API (no locale prefix)
- `POST /api/v1/devices` — register push token (`{ token, platform: "ios"|"android"|"web" }`)
- `DELETE /api/v1/devices/{token}` — unregister push token (own tokens only)
- If a token already exists, it's re-assigned to the current user (handles device transfers)

---

## Authentication

JWT via LexikJWTAuthenticationBundle. Flows: email+password, Google OAuth, Apple OAuth — all return JWT. QR-scanning staff do NOT authenticate (tokenized URL only) unless they have a linked user account.

## QR Check-in Flow

QR encodes `dailybrew:ws:{qrToken}` (data payload, not a URL). Employee opens DailyBrew mobile app → scans QR → app parses token → calls `POST /api/v1/checkin/{qrToken}` with JWT auth. Backend resolves employee from auth user + workspace. Validates IP, device, geofence if enabled → creates/updates Attendance record. Auth always required.

---

## Backend Architecture

Symfony 7 + Doctrine ORM + LexikJWTAuthenticationBundle + KnpPaginatorBundle.

- API prefix: `/api/v1/{_locale}` (en, fr, km) — except Checkin and Device routes which use `/api/v1/` (no locale)
- Controller + Trait pattern, business logic in `src/Service/`
- Notifications: `ExpoPushService` (Expo push API), `EmailService` (Symfony Mailer + Mailgun), orchestrated by `NotificationService`
- Daily summary command: `app:send-daily-summary` (cron, Espresso workspaces only)
- Multi-tenancy: Workspace is root aggregate, WorkspaceVoter handles authorization

---

## Frontend Architecture

React 19 + TypeScript, TanStack Router (file-based) + TanStack Query, shadcn/ui + Radix, Tailwind CSS v4, Zod + React Hook Form, Axios, i18next (en/fr/km), Lucide React icons, Sonner toasts, clsx + tailwind-merge via `cn()` utility (`@/lib/utils`).

Routes: `/sign-in`, `/sign-up`, `/auth/callback`, `/checkin/:qrToken` (public/auth), `/console/*` (auth guard) with dashboard, employees, attendance, leave, shifts, closures, settings, profile.

### Custom UI Components (assets/src/components/shared/)
- **GlassCard** / **GlassCardHeader** — glass-morphism card with optional hover lift
- **CustomSelect** — dropdown with auto-search for 8+ options, check marks, glass design. Uses `position: absolute` (no portal).
- **CustomDatePicker** — calendar grid with month navigation, today highlight. Uses `position: absolute` (no portal). Accepts `isDateDisabled` callback prop to disable specific dates (e.g. closure dates).
- **CustomTimePicker** — hour/minute spinners with 5-min step. Uses `position: absolute` (no portal).
- **LeaveRequestModal** — closure-aware date pickers, partial-day toggle with time pickers, required reason field, type selector (paid/unpaid). Used by both employee dashboard and leave page.
- **Toggle** — pill switch with check/X icon indicator (replaces all checkboxes)
- **ConfirmModal** — Radix dialog with danger/default variants
- **Avatar** — deterministic gradient from name, initials
- **StatusBadge** — colored pill badge (green/amber/red/gray/blue)
- **StatCard** — glass card with colored accent bar
- **EmptyState** — dashed border card with "+" prompt

### Employee dashboard
Route `/console/dashboard` (when `isEmployee && !isOwner`):
- Welcome header with avatar, name, and today's date
- Active closure alert (red) and upcoming closure alert (amber, within 7 days)
- "On approved leave" status displayed when employee has approved leave for today
- My shift today card (shift name + times, or "No shift assigned")
- Check-in/out status with action button (uses geolocation if available)
- Attendance KPI cards (today status, check-in time, check-out time)
- Recent attendance list (last 7 days)
- Upcoming leaves card (pending + approved) with "Submit leave request" button using shared LeaveRequestModal

### Leave requests (employee view)
Route `/console/leave` (when `isEmployee && !isOwner`):
- Filtered to only the current employee's requests
- "Submit leave request" button at top using shared LeaveRequestModal
- Status filter tabs (All, Pending, Approved, Rejected)
- Cancel button with ConfirmModal for pending requests (calls DELETE endpoint)
- No approve/reject buttons (owner-only)

### Attendance (employee view)
Route `/console/attendance` (when `isEmployee && !isOwner`):
- Filtered to own attendance records only
- No employee dropdown selector

### Owner dashboard
Route `/console/dashboard` (when `isOwner`):
- Plan badge next to page title (via PageHeader `badge` prop)
- Action buttons in header row (Add employee, View attendance)
- Pending leave count badge that links to the leave page
- Upcoming leaves section showing both pending and approved with inline approve/reject buttons

### PageHeader component
- Added optional `badge` prop for rendering an inline badge next to the page title

### Settings page
- Espresso-gated toggles (IP restriction, device verification, geofencing) display as OFF when the current plan does not support them, regardless of the persisted server state
- "Use my current IP" button calls `GET /workspaces/{publicId}/settings/my-ip`
- Timezone selector dynamically generated from `Intl.supportedValuesOf('timeZone')` with current UTC offset (DST-aware), fallback to curated list for older browsers

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

# Daily summary notification (run via cron, e.g. daily at 18:00)
php bin/console app:send-daily-summary
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
| `cn()` from `@/lib/utils` for conditional classNames | Template literal className concatenation |
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

BasilBook is an external accounting system. DailyBrew employees can be linked to BasilBook staff records via the `username` field (Espresso plan required). This enables cross-product insights — matching attendance data with accounting/sales data. The username must match the staff name or ID used in BasilBook.

### API Tokens (Espresso)

External integrations authenticate via API tokens stored in the `daily_brew_api_tokens` table.

**ApiToken entity:**
- `prefix` (string 8) — first 8 chars of the raw token, for UI identification (e.g. `db_a3xK9...`)
- `tokenHash` (string 64, unique) — SHA-256 hash of the full token; plain token never stored
- `name` (string 100) — human-readable label (e.g. "BasilBook production")
- `workspace` → Workspace (ManyToOne, CASCADE delete)
- `lastUsedAt` (datetime, nullable) — updated on each authenticated request
- `revokedAt` (datetime, nullable) — set on revocation; `null` = active

Token format: `db_` prefix + 45 alphanumeric characters (e.g. `db_a3xK9mP2nR7bQ4wY8cD1fG6hJ0kL5oU9sT3vX...`).

**Owner API (JWT auth, with locale prefix):**
- `GET /api/v1/{locale}/workspaces/{id}/api-tokens` — list all tokens (active + revoked)
- `POST /api/v1/{locale}/workspaces/{id}/api-tokens` — generate new token (body: `{ "name": "BasilBook" }`)
  - Returns the plain token **once** in the response; subsequent requests only show the prefix
- `DELETE /api/v1/{locale}/workspaces/{id}/api-tokens/{tokenPublicId}` — revoke a token

### BasilBook Attendance API

External endpoint for BasilBook to pull attendance data. Authenticated via `X-Api-Key` header (no JWT, no locale).

**Security:** `BasilBookApiKeyAuthenticator` hashes the incoming key, looks up the active token, resolves the workspace, and authenticates as the workspace owner. Separate firewall (`basilbook`) in security.yaml.

**Endpoint:**
```
GET /api/v1/basilbook/attendances?from=2026-04-01&to=2026-04-30
Header: X-Api-Key: db_a3xK9mP2nR7bQ4wY8cD1fG6hJ0kL5oU9sT3vX...
```

**Rules:**
- Requires Espresso plan (403 if not)
- Both `from` and `to` required (YYYY-MM-DD format)
- Max range: 93 days
- Only returns employees with a `username` (the BasilBook linking field)
- Times formatted in workspace timezone

**Response:**
```json
{
  "workspace": "The Daily Grind",
  "timezone": "Asia/Phnom_Penh",
  "from": "2026-04-01",
  "to": "2026-04-30",
  "employees": [
    {
      "username": "john_doe",
      "name": "John Doe",
      "shiftName": "Morning",
      "records": [
        {
          "date": "2026-04-01",
          "checkInAt": "08:02",
          "checkOutAt": "17:05",
          "isLate": false,
          "leftEarly": false
        }
      ]
    }
  ]
}
```

**Response field reference:**

| Field | Type | Description |
|---|---|---|
| `workspace` | string | Restaurant name |
| `timezone` | string | IANA timezone — all times are formatted in this TZ |
| `from` / `to` | string | Requested date range (YYYY-MM-DD) |
| `employees[].username` | string | BasilBook linking key |
| `employees[].name` | string | Employee full name |
| `employees[].shiftName` | string \| null | Assigned shift, or null |
| `employees[].records[]` | array | Attendance entries in the period (absent days omitted) |
| `records[].date` | string | Calendar date (YYYY-MM-DD) |
| `records[].checkInAt` | string \| null | Check-in time (HH:mm in workspace TZ), null if not checked in |
| `records[].checkOutAt` | string \| null | Check-out time (HH:mm in workspace TZ), null if not checked out |
| `records[].isLate` | boolean | Late relative to shift start time |
| `records[].leftEarly` | boolean | Left before shift end time |

**Notes:**
- Days with no attendance record are **not** included in `records[]` — absence is implied by missing dates
- An employee who checked in but not yet out has `checkOutAt: null`
- `isLate` and `leftEarly` are always `false` if the employee has no assigned shift

---

## Out of scope (do not build unless explicitly asked)

- Payroll / payslip generation
- KPI / evaluation / scoring
- Team members (multi-manager hierarchy beyond owner + manager)
- Employee mobile app (Expo) — check-in is mobile web only
- Export to CSV/Excel
- Demo mode
