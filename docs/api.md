# API Reference

Most routes live under `/api/v1/{locale}` where `{locale}` is `en`, `fr`, or `km` — the locale picks the response language for validation messages and translatable content. Two route families bypass the locale prefix because they're called by mobile apps or external systems where locale doesn't apply: QR check-in (`/api/v1/checkin/...`) and device token registration (`/api/v1/devices/...`).

Authentication is JWT (issued at login or OAuth callback, sent as the `BEARER` cookie) for everything tagged "authenticated". The BasilBook external API is the only exception — it uses the `X-Api-Key` header instead of JWT. Public routes (auth, webhooks, support) require no credentials.

## Response conventions

Responses are **not enveloped** — success payloads are the JSON object (or array) directly, with no `data` wrapper. The HTTP status carries the outcome:

- `200` — success with a body
- `201` — created (returns the new resource)
- `204` — success, no body (deletes, cancels)

Errors return `{ "error": true, "message": "<human-readable>" }` with the appropriate 4xx/5xx status. Some endpoints add extra keys (e.g. the manual-attendance `409` adds `code` + `existing`). Plan-gated endpoints return `402` (or `403`) with the gating message.

Date/time formatting in payloads is consistent throughout:

- Calendar dates → `YYYY-MM-DD` (e.g. `dob`, `startDate`, `date`)
- Times of day → `HH:MM` in the **workspace timezone** (e.g. `checkInAt`, `startTime`)
- Timestamps → ISO 8601 / RFC 3339 with offset (e.g. `createdAt`, `editedAt`, `reviewedAt`)

## Auth (public)

- `POST /api/v1/{locale}/auth/login` — body `{ "email", "password" }`. On success returns the JWT plus the user summary, and sets the `BEARER` + `refresh_token` cookies. The refresh token is also copied into the body for mobile clients. `401` on bad credentials.
  ```json
  {
    "token": "<JWT>",
    "refresh_token": "<token>",
    "user": {
      "publicId": "ab3k9mnp7qrs",
      "email": "owner@cafe.com",
      "firstName": "Dara",
      "lastName": "Sok",
      "fullName": "Dara Sok",
      "locale": "en",
      "onboardingCompleted": true,
      "isSuperAdmin": false
    }
  }
  ```
- `POST /api/v1/{locale}/auth/register` — body `{ "email", "password", "firstName?", "lastName?" }` (password ≥ 8 chars). Returns the same `{ token, user }` shape and sets cookies (no `refresh_token` in body). `409` if the email is taken.
- `POST /api/v1/{locale}/auth/google` / `POST /api/v1/{locale}/auth/apple` — OAuth token exchange; same `{ token, user }` success shape + cookies.
- `POST /api/v1/{locale}/auth/logout` — invalidates the session, expires the `BEARER` + `refresh_token` cookies, **and deletes the refresh-token DB row** (read from cookie, falls back to JSON body `{ "refresh_token": "..." }` for mobile). Idempotent — no-op when the token is absent or already gone.
- `POST /api/token/refresh` — **outside the `/v1` prefix**. Body: `{ "refresh_token": "..." }`. Returns `{ "token": "<new JWT>", "refresh_token": "<rotated token>" }`. `single_use: true` means every successful refresh deletes the consumed token and mints a new one; clients MUST persist the rotated `refresh_token` from the response. Scoped to its own `token_refresh` firewall (ahead of `^/api`) so the JWT cookie authenticator can't intercept — see CLAUDE.md "Refresh-token firewall" for the iOS-specific reason.

## Workspaces (authenticated)

- `GET /api/v1/{locale}/workspaces` — workspaces owned by the caller.
  ```json
  [{ "publicId": "...", "name": "Café One", "qrToken": "...", "logoUrl": "https://.../logo.png", "createdAt": "2026-01-04T08:00:00+00:00" }]
  ```
- `POST /api/v1/{locale}/workspaces` — body `{ "name", "timezone?" }`. Returns `201` `{ publicId, name, qrToken, createdAt }`.
- `GET /api/v1/{locale}/workspaces/{publicId}` — returns the workspace plus a thin `setting` summary:
  ```json
  {
    "publicId": "...", "name": "Café One", "qrToken": "...",
    "logoUrl": "https://.../logo.png", "createdAt": "2026-01-04T08:00:00+00:00",
    "setting": { "ipRestrictionEnabled": false, "allowedIps": [], "timezone": "Asia/Phnom_Penh" }
  }
  ```
- `PUT /api/v1/{locale}/workspaces/{publicId}` — body `{ "name" }`. Returns `{ publicId, name }`.
- `POST /api/v1/{locale}/workspaces/{publicId}/regenerate-qr-token` — rotates the main QR token (owner only). Returns `{ publicId, qrToken }`.
- `DELETE /api/v1/{locale}/workspaces/{publicId}` — `204`.
- `GET/PUT /api/v1/{locale}/workspaces/{publicId}/settings` — see [Settings](#settings) below.
- `GET /api/v1/{locale}/workspaces/{publicId}/dashboard` — today's stats:
  ```json
  {
    "totalEmployees": 12, "present": 8, "late": 1, "onLeave": 1, "absent": 2,
    "pendingLeaves": 3,
    "recentAttendance": [ /* up to 10 AttendanceDTO objects, with employee fields */ ]
  }
  ```
  `totalEmployees` is the seat-limit count (includes `attendanceTracking=none`); `absent` is computed against the narrower tracked-and-scheduled baseline.
- `GET /api/v1/{locale}/workspaces/{publicId}/plan` — plan + entitlement flags + subscription state:
  ```json
  {
    "plan": "espresso", "planLabel": "Espresso",
    "isEspresso": true, "isDoubleEspresso": false,
    "isTrialing": false, "trialDaysRemaining": null, "trialEndsAt": null,
    "employeeLimit": 20, "remainingEmployeeSlots": 8,
    "canUseIpRestriction": true, "canUseGeofencing": true, "canUseLeaveRequests": true,
    "canUseShiftTimeRules": true, "canUseDeviceVerification": true, "canUseManagers": true,
    "canUseTelegramNotifications": true, "canUseTapCheckin": true, "canUseNfcCheckin": true,
    "canUseSubQrCodes": false, "canExportAttendance": true,
    "managerLimit": 2, "managerCount": 1,
    "currentPeriodEnd": "2026-07-04T00:00:00+00:00", "status": "active",
    "paddleSubscriptionId": "sub_..."
  }
  ```

### Settings

- `GET /api/v1/{locale}/workspaces/{publicId}/settings` — full settings object (defaults applied when no row exists):
  ```json
  {
    "ipRestrictionEnabled": false, "allowedIps": null,
    "timezone": "Asia/Phnom_Penh", "dateFormat": "DD/MM/YYYY",
    "deviceVerificationEnabled": false,
    "geofencingEnabled": false, "geofencingLatitude": null, "geofencingLongitude": null, "geofencingRadiusMeters": 100,
    "telegramNotificationsEnabled": false, "telegramChatId": null,
    "telegramCheckinAlertsEnabled": false, "pushCheckinAlertsEnabled": false,
    "tapCheckinEnabled": false, "nfcCheckinEnabled": false, "nfcCheckinIntervalMinutes": 15
  }
  ```
- `PUT /api/v1/{locale}/workspaces/{publicId}/settings` — partial update; any subset of the above keys. Espresso-gated toggles (IP / device / geofencing / Telegram / push alerts / tap / NFC) return `402` if the plan doesn't support them. `nfcCheckinIntervalMinutes` must be 0–120. Returns the full settings object (same shape as `GET`).
- `GET /api/v1/{locale}/workspaces/{publicId}/settings/my-ip` — `{ "ip": "203.0.113.7" }` (client IP as seen by the server).
- `POST /api/v1/{locale}/workspaces/{publicId}/settings/telegram-link-token` — Espresso. Returns `{ "token", "deepLink": "https://t.me/<bot>?startgroup=<token>", "expiresInSeconds": 600 }`.
- `POST /api/v1/{locale}/workspaces/{publicId}/settings/telegram-test` — Espresso. Returns `{ "sent": true }` (or `502` if Telegram rejected it).

## Employees (authenticated, scoped to workspace)

`EmployeeDTO` shape (returned by list/create/update/detail, and nested in some responses):

```json
{
  "publicId": "...", "firstName": "Dara", "lastName": "Sok", "name": "Dara Sok",
  "jobTitle": "Barista", "username": "dara", "phoneNumber": "+855...",
  "active": true, "role": "employee",
  "linkedUserPublicId": "...", "linkedUserEmail": "dara@x.com",
  "shiftName": "Morning", "shiftPublicId": "...",
  "dob": "1998-03-12", "joinedAt": "2025-11-01", "linkedAt": "2025-11-02", "leftAt": null,
  "createdAt": "2025-11-01T09:00:00+00:00",
  "managerPermissions": [], "attendanceTracking": "full",
  "photoUrl": "https://.../headshot.png"
}
```

- `GET /api/v1/{locale}/workspaces/{publicId}/employees` — list of `EmployeeDTO`.
- `POST /api/v1/{locale}/workspaces/{publicId}/employees` — create; returns `201` `EmployeeDTO`. `role` may be set here (owner-only when promoting to manager; seeds `[manage_leave, manage_attendance]`). `409` on duplicate first+last name.
- `GET /api/v1/{locale}/workspaces/{publicId}/employees/{publicId}` — `EmployeeDTO` plus an `attendance` array (recent `AttendanceDTO` rows for this employee).
- `PUT /api/v1/{locale}/workspaces/{publicId}/employees/{publicId}` — update employee fields, including `role` for owner-only manager promotion/demotion. Promoting seeds `managerPermissions` with the defaults `[manage_leave, manage_attendance]` when the field is empty; demoting clears it. Returns the updated `EmployeeDTO`.
- `PATCH /api/v1/{locale}/workspaces/{publicId}/employees/{publicId}/manager-permissions` — set the manager's permission list (owner only). Body: `{ "permissions": ["manage_employees", "manage_shifts", "manage_closures", "manage_leave", "manage_attendance"] }`. Unknown values are rejected. Returns the updated `EmployeeDTO`.
- `DELETE /api/v1/{locale}/workspaces/{publicId}/employees/{publicId}` — soft-delete; `204`.

## Shifts (authenticated, scoped to workspace)

`ShiftDTO`:

```json
{
  "publicId": "...", "name": "Morning",
  "startTime": "08:00", "endTime": "16:00",
  "graceLateMinutes": 5, "graceEarlyMinutes": 5,
  "timeRules": [
    { "publicId": "...", "dayOfWeek": 1, "dayOfWeekLabel": "Monday", "startTime": "08:00", "endTime": "16:00" }
  ]
}
```

`dayOfWeek` is ISO (1 = Monday … 7 = Sunday). A shift with any `timeRules` is treated as its complete schedule (Espresso).

- `GET /api/v1/{locale}/workspaces/{publicId}/shifts` — list of `ShiftDTO`.
- `POST /api/v1/{locale}/workspaces/{publicId}/shifts` — `201` `ShiftDTO`.
- `PUT /api/v1/{locale}/workspaces/{publicId}/shifts/{publicId}` — updated `ShiftDTO`.
- `DELETE /api/v1/{locale}/workspaces/{publicId}/shifts/{publicId}` — `204`.

## Closures (authenticated, scoped to workspace)

`ClosurePeriod` shape: `{ "publicId", "name", "startDate", "endDate", "createdAt" }` (create omits `createdAt`).

- `GET /api/v1/{locale}/workspaces/{publicId}/closures` — list.
- `POST /api/v1/{locale}/workspaces/{publicId}/closures` — body `{ "name", "startDate", "endDate" }`. Returns `201`.
- `PUT /api/v1/{locale}/workspaces/{publicId}/closures/{publicId}` — updated closure.
- `DELETE /api/v1/{locale}/workspaces/{publicId}/closures/{publicId}` — `204`.

## Leave requests (authenticated, scoped to workspace)

`LeaveRequestDTO`:

```json
{
  "publicId": "...", "employeePublicId": "...", "employeeName": "Dara Sok",
  "startDate": "2026-06-20", "endDate": "2026-06-22",
  "startTime": null, "endTime": null, "isFullDay": true,
  "type": "paid", "reason": "Family trip",
  "status": "pending", "reviewedAt": null,
  "createdAt": "2026-06-11T10:00:00+00:00"
}
```

- `GET /api/v1/{locale}/workspaces/{publicId}/leave-requests` — list of `LeaveRequestDTO`.
- `POST /api/v1/{locale}/workspaces/{publicId}/leave-requests` — `201` `LeaveRequestDTO`. Create uses `WorkspaceVoter::VIEW` (backend enforces self-only); rejects closure overlap and duplicate pending/approved.
- `PUT /api/v1/{locale}/workspaces/{publicId}/leave-requests/{publicId}` — approve/reject (owner / manager with `manage_leave`); returns the updated `LeaveRequestDTO`.
- `DELETE /api/v1/{locale}/workspaces/{publicId}/leave-requests/{publicId}` — cancel (employee: own pending only; owner: any; manager with `manage_leave`: any; per-QR manager: any belonging to an assigned employee). `204`.

## Attendances (authenticated, scoped to workspace)

`AttendanceDTO` (returned by override/create/void; nested in dashboard + employee detail). The `employeePublicId` / `employeeName` / `shiftName` trio is present only when the row includes employee context:

```json
{
  "publicId": "...", "date": "2026-06-11",
  "checkInAt": "08:03", "checkOutAt": "16:01", "isLate": true, "leftEarly": false,
  "editedAt": null, "editedByEmail": null, "editReason": null,
  "originalCheckInAt": null, "originalCheckOutAt": null,
  "voidedAt": null, "voidedByEmail": null, "voidReason": null,
  "employeePublicId": "...", "employeeName": "Dara Sok", "shiftName": "Morning"
}
```

- `GET /api/v1/{locale}/workspaces/{publicId}/attendances?from=&to=` — flat **log rows** (not bare `AttendanceDTO`s) for the date range. Owner / manager with `manage_attendance` see all; otherwise scoped to the caller. Each row carries a `status` of `present`, `absent`, `on_leave`, or `voided`, plus the audit fields. Absent / on-leave rows have a synthetic `publicId` (`<status>-<employeePublicId>-<date>`) and null times.
  ```json
  [{
    "publicId": "...", "employeePublicId": "...", "employeeName": "Dara Sok", "shiftName": "Morning",
    "date": "2026-06-11", "checkInAt": "08:03", "checkOutAt": "16:01",
    "isLate": true, "leftEarly": false, "status": "present",
    "editedAt": null, "editedByEmail": null, "editReason": null,
    "originalCheckInAt": null, "originalCheckOutAt": null,
    "voidedAt": null, "voidedByEmail": null, "voidReason": null
  }]
  ```
- `GET /api/v1/{locale}/workspaces/{publicId}/attendances/summary?from=&to=` — per-employee, per-day gantt. Each `days[]` entry has a `status` of `present`, `absent`, `upcoming`, `off`, `closure`, or `leave`; `present` days carry times + audit fields, `leave` days carry `leaveType`.
  ```json
  [{
    "employeePublicId": "...", "employeeName": "Dara Sok", "shiftName": "Morning",
    "days": [
      { "date": "2026-06-11", "status": "present", "attendancePublicId": "...", "checkInAt": "08:03", "checkOutAt": "16:01", "isLate": true, "leftEarly": false, "editedAt": null, "editedByEmail": null, "editReason": null, "originalCheckInAt": null, "originalCheckOutAt": null },
      { "date": "2026-06-12", "status": "leave", "leaveType": "paid" },
      { "date": "2026-06-13", "status": "off" }
    ]
  }]
  ```
- `GET /api/v1/{locale}/workspaces/{publicId}/attendances/export.xlsx?from=&to=&employeePublicId=` — binary `.xlsx` download (Espresso+). `GET .../export.pdf` is the same as a PDF. Both `402` without the plan.
- `POST /api/v1/{locale}/workspaces/{publicId}/attendances` — manual entry (owner / manager with `manage_attendance`, workspace-scoped only). Body: `{ "employeePublicId", "date": "YYYY-MM-DD", "checkInAt": "HH:MM", "checkOutAt"?: "HH:MM" | null, "reason" }`. Returns `201` `AttendanceDTO` (with employee). On `(employee, date)` collision against a non-voided row, returns **`409`** with the existing record so the client can switch to editing:
  ```json
  { "error": true, "message": "...", "code": 409, "existing": { /* AttendanceDTO */ } }
  ```
- `PATCH /api/v1/{locale}/workspaces/{publicId}/attendances/{attendancePublicId}` — owner / manager with `manage_attendance` override an existing row. Body: `{ "checkInAt"?: "HH:MM" | null, "checkOutAt"?: "HH:MM" | null, "reason" }`. Times are workspace-local; reason required (≤255 chars). First edit snapshots `originalCheckInAt`/`originalCheckOutAt`. Late/leftEarly recompute. Blocked (`400`) on voided rows. Returns the updated `AttendanceDTO` (with employee).
- `DELETE /api/v1/{locale}/workspaces/{publicId}/attendances/{attendancePublicId}` — soft-void (owner / manager with `manage_attendance`). Body: `{ "reason" }` (≤255 chars). Returns the voided `AttendanceDTO` (with employee + populated `voidedAt`/`voidedByEmail`/`voidReason`).

## API Tokens (authenticated, owner only)

- `GET /api/v1/{locale}/workspaces/{publicId}/api-tokens` — list (active + revoked). The plain token value is **never** returned here.
  ```json
  [{ "publicId": "...", "name": "BasilBook", "prefix": "db_a1b2c", "active": true, "lastUsedAt": "2026-06-10T12:00:00+00:00", "revokedAt": null, "createdAt": "2026-06-01T09:00:00+00:00" }]
  ```
- `POST /api/v1/{locale}/workspaces/{publicId}/api-tokens` — generate (Espresso+). Body `{ "name": "BasilBook" }`. Returns `201` — **the only time the full token is returned**:
  ```json
  { "publicId": "...", "name": "BasilBook", "prefix": "db_a1b2c", "token": "db_<45 alphanum>", "createdAt": "2026-06-11T09:00:00+00:00" }
  ```
- `DELETE /api/v1/{locale}/workspaces/{publicId}/api-tokens/{tokenPublicId}` — revoke; `204`. `409` if already revoked.

## QR Check-in (authenticated, no locale)

Main QR routes by `/checkin/{workspaceQrToken}`; sub-QR (Double Espresso) by `/checkin/qr/{qrToken}` (adds a `qrCodeName` field to the status response and gates on `assignedEmployees`).

- `GET /api/v1/checkin/{workspaceQrToken}` — status for the caller's employee record in this workspace:
  ```json
  {
    "employeeName": "Dara Sok", "shiftName": "Morning", "shiftStart": "08:00", "shiftEnd": "16:00",
    "onLeave": false, "leaveIsFullDay": false,
    "workspaceTapCheckinEnabled": true, "workspaceNfcCheckinEnabled": false,
    "today": { "checkedIn": true, "checkedOut": false, "checkInAt": "08:03", "checkOutAt": null, "isLate": true }
  }
  ```
- `POST /api/v1/checkin/{workspaceQrToken}` — perform check-in/out. Body (all optional): `{ "latitude", "longitude", "deviceId", "deviceName", "origin": "nfc"? }`. Pipeline: closure → leave → IP → device → geofence → create/update → late/early. Returns:
  ```json
  {
    "checkInAt": "08:03", "checkOutAt": null, "isLate": true, "leftEarly": false,
    "verification": { "location": false, "device": true, "network": true }
  }
  ```
  `verification` reflects which protections were enforced (never raw coordinates/IP/device id). Rejections return `403` (not registered / not in `assignedEmployees` / NFC disabled / IP / device / geofence).
- `GET/POST /api/v1/checkin/qr/{qrToken}` — same shapes; the GET status adds `"qrCodeName"`.

## Device Tokens (authenticated, no locale)

- `POST /api/v1/devices` — register push notification token (Expo). Body `{ "token", "platform": "ios"|"android"|"web" }`.
- `DELETE /api/v1/devices/{token}` — unregister; `204`.

## Webhooks (public)

- `POST /api/v1/webhooks/paddle` — Paddle subscription lifecycle webhook (signature-verified).

## BasilBook API

External attendance pull for the BasilBook accounting integration. Uses `X-Api-Key` instead of JWT (the key resolves to its workspace via `BasilBookApiKeyAuthenticator`), and has **no locale prefix**. Espresso-gated (`403` otherwise). Issue the key with the [API Tokens](#api-tokens-authenticated-owner-only) endpoints above.

- `GET /api/v1/basilbook/attendances?from=YYYY-MM-DD&to=YYYY-MM-DD` — attendance for the range, grouped per employee. Only employees with a `username` are returned; voided rows and absent days are omitted; times are in the workspace timezone. Both `from` and `to` are required and the range may not exceed **93 days**.
  ```json
  {
    "workspace": "The Daily Grind",
    "timezone": "Asia/Phnom_Penh",
    "from": "2026-04-01",
    "to": "2026-04-30",
    "employees": [{
      "username": "john_doe",
      "name": "John Doe",
      "shiftName": "Morning",
      "records": [
        { "date": "2026-04-01", "checkInAt": "08:02", "checkOutAt": "17:05", "isLate": false, "leftEarly": false }
      ]
    }]
  }
  ```
  Manually overridden rows report the edited times (not the original scan). Errors: `401` (missing/invalid key), `403` (not Espresso), `422` (missing/invalid dates or range > 93 days).

See [basilbook.md](./basilbook.md) for the full field reference, the `username` linking model, and token lifecycle.
