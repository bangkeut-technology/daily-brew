# CLAUDE.md — DailyBrew

Staff attendance & leave tracking for restaurants. Symfony 7 + React 19 (Webpack Encore).

## Product scope

Owner creates Workspace (restaurant), adds Employees with Shifts. Workspace QR at restaurant; employees scan via mobile app to check in/out. Attendance compared to Shift → late/left-early flags. Staff submit Leave Requests; owner/manager approves. Closures suppress attendance expectations.

**Out of scope (defer):** payroll, KPI/scoring, LinkedIn OAuth, employee mobile app (check-in is mobile web), CSV export, demo mode.

### Plans
- **Free** — ≤10 employees
- **Espresso** ($14.99/mo, $149/yr) — ≤20 employees, IP restriction, device verification, geofencing, per-day shifts, leave management, BasilBook `username` linking, manager (max 2), Expo push + Mailgun email, daily summary
- **Double Espresso** ($39.99/mo, $399/yr) — unlimited employees & managers, sub-QR codes (per-cluster IP/geofence/device overrides, optional per-QR manager)

Users can be owner and/or employee in different workspaces; onboarding chooses initial role.

## Data model

All entities carry `id`, `publicId` (UUID), `createdAt`, `updatedAt`.

- **User** — email, password (nullable for OAuth), googleId, appleId, currentWorkspace, ROLE_USER (+ optional ROLE_SUPER_ADMIN)
- **Workspace** — name, qrToken (unique), owner
- **WorkspaceSetting** (1:1) — ipRestrictionEnabled+allowedIps, deviceVerificationEnabled, timezone (IANA, default `Asia/Phnom_Penh`), dateFormat, geofencing (enabled/lat/lng/radiusMeters)
- **Shift / Closure** — workspace+name+start/end (time / date)
- **Employee** — workspace, user (creator), linkedUser (nullable; unique with workspace), shift, firstName, lastName, username, phoneNumber, dob, joinedAt, role (employee/manager), status, attendanceTracking (`EmployeeAttendanceTrackingEnum`: `full` default | `none`), deletedAt
- **Attendance** — employee, workspace, qrCode (nullable, ON DELETE SET NULL — null = main QR), date, checkInAt/checkOutAt, isLate, leftEarly, ipAddress, checkIn/OutDeviceId/Name. Unique (employee, date)
- **LeaveRequest** — employee, startDate, endDate, startTime/endTime (both null = full day), reason, type (paid/unpaid), status, reviewedAt
- **WorkspaceQrCode** (Double Espresso) — workspace (CASCADE), qrToken (unique), name, manager (Employee, nullable, ON DELETE SET NULL, linked user required), assignedEmployees M:N. Inherit flags+overrides: `inheritIpSettings`, `inheritGeofencing`, `inheritDeviceVerification`. Timezone always inherited.
- **DeviceToken** — Expo token (unique), platform (ios/android/web), user (CASCADE)
- **ApiToken** — prefix (8), tokenHash (SHA-256, unique), name, workspace, lastUsedAt, revokedAt. Plain never stored. Format `db_`+45 alphanum.
- **AdminAuditLog** — actor (ON DELETE SET NULL), actorEmail/targetLabel snapshots, action, targetType/PublicId.

## Business rules

**Closures & leave.** Skip attendance on closure dates. `LeaveRequestService::create` enforces startDate ≤ endDate, no closure overlap (`ClosurePeriodRepository::findOverlappingClosure`), no duplicate pending/approved (`LeaveRequestRepository::findOverlappingForEmployee`). CREATE uses `WorkspaceVoter::VIEW` (backend enforces self-only); employees DELETE own pending; owners/managers cancel any. `CheckinService` blocks check-in on approved full-day leave; status returns `onLeave`+`leaveIsFullDay`.

**Late/early.** Computed at check-in/out vs assigned Shift + grace minutes. No shift → always false. **`attendanceTracking=none` employees never get flagged regardless of shift** — `CheckinService` skips the late/leftEarly branches via `$employee->isAttendanceTracked()`. All comparisons in workspace TZ.

**Attendance tracking modes** (`Employee.attendanceTracking`):
- `full` (default) — counted in `DashboardService` absent calc, late/leftEarly flags fire when shift assigned.
- `none` — excluded from absent baseline (`EmployeeRepository::countAttendanceTrackedByWorkspace` powers the calc; the existing `countActiveByWorkspace` still counts them for seat-limit checks). Check-in still allowed; times recorded; flags never set. For admin helpers and flexible-hours staff who shouldn't be "absent" if they skip a day. Editable on the new + edit employee forms via a `CustomSelect`; "Not tracked" badge on detail + list rows when set.

**Timezone (critical).**
- Server PHP `date.timezone = UTC`. Per-workspace TZ in `WorkspaceSetting.timezone` (IANA), auto-detected at creation, validated via `DateTimeZone::listIdentifiers()`. `datetime` stores UTC; `date` stores workspace-local calendar date.
- **Mandatory `App\Service\DateService`** — never `new \DateTime`/`\DateTimeImmutable`. Methods: `now`, `today($tz)`, `relative`, `parse`, `createFromFormat`, `toUtc`, `mutableNow`/`Relative`/`Parse`, `utc`. Tests pin "now" via `DateService::setClock(new MockClock(...))` (Psr\Clock — every "now"-dependent method consults it); always `DateService::setClock(null)` in `tearDown` so other tests don't inherit a frozen clock.
- **Frontend**: `lib/timezone.ts` (`todayInTimezone`, `parseDateAsUTC`, `formatDateUTC`, `nowInTimezone`, `startOfMonthInTimezone`) + `hooks/useWorkspaceTimezone.ts`. Never `new Date().toISOString().split('T')[0]` — use `wsTz.today()`. Never `new Date('YYYY-MM-DD')` — use `parseDateAsUTC()`.

**QR check-in.**
- Main QR = `dailybrew:ws:{token}`; sub-QR = `dailybrew:wqr:{token}`. Mobile routes by prefix → `POST /api/v1/checkin/{token}` or `/api/v1/checkin/qr/{token}`.
- Auth always required; backend resolves employee from JWT+workspace; 403 if not found or not in `assignedEmployees` (sub-QR).
- Pipeline: closure → leave → IP → device → geofence → Attendance create/update → late/early.
- IP: enabled + non-empty `allowedIps` → reject if not in list. "Use my current IP" → `GET /workspaces/{publicId}/settings/my-ip`.
- Device verification (Espresso): frontend stores UUID in `localStorage` (`dailybrew_device_id`). On check-in reject if device used by another employee today; on check-out reject if device differs. Always store both for audit.
- Sub-QR settings via `App\Service\Checkin\EffectiveCheckinSettings::fromWorkspace()`/`::fromQrCode()`. `CheckinService::checkin()` accepts optional `EffectiveCheckinSettings`.
- **Wording:** never "inherit"/"override". Toggle = "Same as workspace" vs custom rules.

**Roles & linking.**
- User↔Employee ManyToOne; composite unique (linkedUser, workspace) — one per workspace, linkable across.
- Manager (Espresso): linked user required, max 2 / unlimited (Double Espresso). Capabilities granted per-manager via `Employee.managerPermissions` (JSON list of `ManagerPermissionEnum`): `manage_employees`, `manage_shifts`, `manage_closures`, `manage_leave`, `manage_attendance`. Newly promoted managers default to `[manage_leave, manage_attendance]` (matches pre-feature behavior of "view all attendance + approve leave"). Existing managers were back-filled to the same defaults. Cannot edit workspace settings/billing/sub-QR codes or promote managers — owner-only. `manage_attendance` controls "see all employees' attendance vs. only own" in `AttendanceController::list`/`summary`.
- `WorkspaceVoter`: `MANAGE` = owner + any manager (legacy, role-based). Capability attributes `MANAGE_EMPLOYEES`/`_SHIFTS`/`_CLOSURES`/`_LEAVE_REQUESTS`/`_ATTENDANCES` on a `Workspace` subject (used by create/list endpoints) and `EDIT`/`DELETE` on a typed entity (`Employee`, `Shift`, `ClosurePeriod`, `Attendance`, `LeaveRequest`) both resolve to the matching `ManagerPermissionEnum`. `EDIT`/`DELETE` on a `Workspace` subject remain owner-only. Owner is granted everything.
- Permissions managed via owner-only `PATCH /workspaces/{ws}/employees/{emp}/manager-permissions` `{ permissions: string[] }`.
- Role can be set as part of `POST /employees` and `PUT /employees/{id}` — both are owner-only when promoting to manager, run the same plan-limit + linkedUser checks, and seed `[manage_leave, manage_attendance]` defaults on first promotion.
- Per-QR manager (Double Espresso): scoped to attendance/leave for employees in that QR's `assignedEmployees`. No edit rights for shifts/closures/settings/QR. Per-QR scope is **additive** to workspace-wide permissions, not AND-ed.
- **Frontend permission gating**: the sidebar builds the manager nav from `roleContext.managerPermissions` (only shows Employees / Shifts / Closures when the matching permission is granted). The `/console` route guard mirrors this via `PERMISSION_GATED_ROUTES` — manager without `manage_shifts` clicking `/console/shifts` is redirected to dashboard. Settings + QR-codes routes stay owner-only.
- Employee dup: 409 on same firstName+lastName; queries filter `deletedAt IS NULL`. Attendance unique per (employee, date); double check-in returns existing.
- `currentWorkspace` on User + localStorage; restored from server if empty.

**Workspace deletion.** `WorkspaceService::delete()` cancels active Paddle sub via API (failure logged+swallowed) before soft-delete; sub marked Canceled locally regardless. Also clears `currentWorkspace` on the owner and on every linked user pointing at this workspace so the `role-context` endpoint doesn't drop them back on the deleted dashboard. `WorkspaceRepository::findByOwner()` filters `deletedAt IS NULL` — use `findAllByOwnerIncludingDeleted()` for admin views that need deletion history. `AccountDeletionService::softDelete()` delegates per owned WS.

**Notifications (Espresso).** Push (Expo) + email (Mailgun) via `NotificationService` → `ExpoPushService`+`EmailService`. Events: leave submitted (→owner), approved/rejected (→employee), shift changed (→employee), closure (→linked employees), daily summary (→owner, cron `app:send-daily-summary`). Payloads include `type`+`workspacePublicId`.

**Platform admin (`/admin/*`).** Gated by `ROLE_SUPER_ADMIN`. Bootstrap: idempotent CLI `dailybrew:admin:promote-user <email>` (only path without existing super-admin); then promote/demote in UI (`POST /admin/users/{publicId}/promote|demote`), self-demote rejected (400). `UserDTO.isSuperAdmin` exposed. `AdminAuditService::record()` is wrap-and-log — failures swallowed so audit can't roll back the already-flushed action. Endpoints under `/api/v1/{locale}/admin`: dashboard, workspaces (with restore), users, subscriptions, audit-log. `/admin/*` redirects to `/console/dashboard` if not super-admin.

## Architecture

Auth: JWT (LexikJWT) — email+password, Google OAuth, Apple OAuth. BasilBook: `basilbook` firewall + `BasilBookApiKeyAuthenticator` (`X-Api-Key`).

Backend: Symfony 7 + Doctrine + LexikJWT + KnpPaginator. API `/api/v1/{_locale}` (en/fr/km), except checkin/device (no locale). Controller+Trait; logic in `src/Service/`. Multi-tenant: Workspace root, `WorkspaceVoter`.

Frontend: React 19 + TS, TanStack Router + Query, shadcn/ui + Radix, Tailwind v4, Zod + RHF, Axios, i18next, Lucide, Sonner, `cn()` (`@/lib/utils`). Routes: `/sign-in`, `/sign-up`, `/auth/callback`, `/checkin/:qrToken`, `/console/*`, `/admin/*`. Shared (`assets/src/components/shared/`): GlassCard, CustomSelect (auto-search 8+), CustomDatePicker (`isDateDisabled`, `todayOverride`), CustomTimePicker (5-min), LeaveRequestModal, Toggle, ConfirmModal, Avatar, StatusBadge, StatCard, EmptyState, PageHeader (`badge`). Public-ID format validation (`lib/publicId.ts`: `isValidPublicIdFormat`, `publicIdFormatError`) mirrors backend `TokenGenerator::generatePublicId()` — 12 chars from `abcdefghjkmnpqrstuvwxyz23456789` (no i/l/o/0/1). Used for blur validation on link-user / linkedUserPublicId fields.

## Style guide

Warm cafe glassmorphism, dark mode with coffee tones. **Palette** (light→dark): cream `#FAF7F2`→`#1E1916`, coffee `#6B4226`→`#E8A85A` (primary), amber accent, green `#4A7C59`, red `#C0392B`, blue `#3B6FA0`, glass-bg/border. **Typography**: Palatino/Georgia serif 24px/600 headings; system sans 13–14px body; SF Mono tabular-nums timestamps. **Patterns**: glass cards `bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl` with hover lift; stat cards colored top accent bar; primary `bg-coffee text-white`, secondary `bg-glass-bg border border-cream-3`; transitions fade + 6px slide-up 0.25s.

**Hard rules:** `cn()` from `@/lib/utils` (not template-literal classNames). Never native `<select>`, `<input type="date"|"time">`, checkboxes, `confirm`/`alert`/`prompt` — use Custom* / Toggle / ConfirmModal. Edit/delete buttons always visible — no `opacity-0 group-hover:opacity-100`. Inputs always have `id`+`name`; labels use `htmlFor`. `bg-glass-bg` not `bg-white/30`; sentence case; serif for titles only. Espresso-gated toggles render OFF when plan doesn't support them. Timezone selector from `Intl.supportedValuesOf('timeZone')` with DST-aware offset.

## BasilBook integration

Cross-product link via Employee `username` (Espresso). Tokens at `/api/v1/{locale}/workspaces/{id}/api-tokens`. Pull: `GET /api/v1/basilbook/attendances?from=&to=` with `X-Api-Key`. Max 93 days, only `username`-set employees, times in workspace TZ, absent days omitted.

## Commands

```bash
composer install && php bin/console doctrine:migrations:migrate && php bin/console lexik:jwt:generate-keypair
npm ci && npm run router:generate && npm run dev
php bin/console app:send-daily-summary             # cron daily ~18:00
php bin/console dailybrew:admin:promote-user <email>
```
