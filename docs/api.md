# API Reference

Most routes live under `/api/v1/{locale}` where `{locale}` is `en`, `fr`, or `km` — the locale picks the response language for validation messages and translatable content. Some route families bypass the locale prefix because they're called by mobile apps or external systems where locale doesn't apply: QR check-in (`/api/v1/checkin/...`), device token registration (`/api/v1/devices/...`), support (`/api/v1/support/...`), webhooks (`/api/v1/webhooks/...`), the BasilBook feed, and `POST /api/token/refresh` (which sits outside `/v1` entirely).

Authentication is JWT (issued at login or OAuth callback, sent as the `BEARER` cookie) for everything tagged "authenticated". The BasilBook external API is the only exception — it uses the `X-Api-Key` header instead of JWT. Public routes (auth, webhooks, support, feature flags) require no credentials. The `/admin` family additionally requires `ROLE_SUPER_ADMIN`.

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
- `POST /api/v1/{locale}/auth/forgot-password` — body `{ "email" }`. Always returns `200` `{ "message": "If an account exists, a reset link has been sent." }` — the response is deliberately identical for known and unknown addresses so it can't be used to enumerate accounts.
- `POST /api/v1/{locale}/auth/reset-password` — body `{ "token", "password" }` (≥ 8 chars). `400` on an unknown or expired token. Returns `{ "message": "Password has been reset successfully" }`.

## Users & account (authenticated)

The caller's own account. `UserDTO` is the shape returned by `GET`/`PUT /users/me` and nested in the auth responses above (minus `currentWorkspacePublicId` / `avatarUrl` there):

```json
{
  "publicId": "ab3k9mnp7qrs", "email": "owner@cafe.com",
  "firstName": "Dara", "lastName": "Sok", "fullName": "Dara Sok",
  "locale": "en", "onboardingCompleted": true,
  "currentWorkspacePublicId": "cd4m8pqr2tuv",
  "isSuperAdmin": false, "avatarUrl": "https://.../avatar.png"
}
```

- `GET /api/v1/{locale}/users/me` — the `UserDTO` above.
- `PUT /api/v1/{locale}/users/me` — partial update of `firstName`, `lastName`, `locale`. Returns the updated `UserDTO`.
- `DELETE /api/v1/{locale}/users/me` — account deletion (soft). Soft-deletes every owned workspace via `AccountDeletionService`, clears the `BEARER` + `refresh_token` cookies, returns `{ "deleted": true }`.
- `POST /api/v1/{locale}/users/me/change-password` — body `{ "currentPassword", "newPassword" }` (≥ 8 chars). `currentPassword` is only verified when the account already has one — OAuth-only accounts set their first password without it. `403` when the current password is wrong.
- `POST /api/v1/{locale}/users/me/complete-onboarding` — `{ "onboardingCompleted": true }`.
- `GET /api/v1/{locale}/users/me/current-workspace` — `{ "publicId", "name" }`, or `null` when none is selected.
- `PUT /api/v1/{locale}/users/me/current-workspace` — body `{ "workspacePublicId": "..." | null }`. `204`-style `null` body on success, `404` for an unknown workspace.
- `GET /api/v1/{locale}/users/me/role-context?workspaceId=` — the payload the console's route guards and sidebar are built from. `workspaceId` overrides the server-side `currentWorkspace` (the frontend passes its localStorage value).
  ```json
  {
    "isOwner": false, "isEmployee": true, "isManager": true,
    "managerPermissions": ["manage_leave", "manage_attendance"],
    "onboardingCompleted": true,
    "ownedWorkspaces": [{ "publicId": "...", "name": "Café One" }],
    "employee": { "publicId": "...", "name": "Dara Sok", "photoUrl": "https://...", "workspacePublicId": "...", "workspaceName": "Café One" },
    "linkedWorkspaces": [{ "workspacePublicId": "...", "workspaceName": "Café One", "employeePublicId": "...", "employeeName": "Dara Sok", "role": "manager" }]
  }
  ```
- `POST /api/v1/{locale}/users/me/link-employee` — body `{ "employeePublicId" }`. Claims an unlinked employee record. Rejects when the record is already linked, or when the caller already holds an employee record in that workspace. Returns `{ publicId, name, workspaceName }`.
- `POST /api/v1/{locale}/users/me/unlink-employee` — body `{ "employeePublicId" }`. Own link only (`403` otherwise); also clears `currentWorkspace` when it pointed at that workspace and the caller isn't its owner.

### OAuth & Telegram connections

- `GET /api/v1/{locale}/users/me/oauth` — `{ "google": true, "apple": false, "hasPassword": true }`.
- `POST /api/v1/{locale}/users/me/oauth/{provider}` — `provider` is `google` or `apple`; body carries `{ "googleId" }` / `{ "appleId" }`. `409` when that provider identity already belongs to another account. Returns `{ "connected": true }`.
- `DELETE /api/v1/{locale}/users/me/oauth/{provider}` — `{ "disconnected": true }`. `400` when it would leave the account with no way to sign in.
- `POST /api/v1/{locale}/users/me/oauth/link-token` — mints a 5-minute JWT into an `OAUTH_LINK` cookie scoped to `/oauth/connect`, so the browser OAuth round-trip knows who is linking. The regular `BEARER` cookie can't be used: it's scoped to `/api/v1` and `SameSite=Lax`, so it wouldn't survive Apple's cross-site POST callback. Returns `{ "ok": true }` — call it and await it *before* redirecting to `/oauth/connect`.
- `GET /api/v1/{locale}/profile/connect` — `{ "hasPassword", "googleConnected", "appleConnected" }`.
- `POST /api/v1/{locale}/profile/connect/google` — body `{ "idToken" }` (verified against Google's tokeninfo endpoint). `POST .../apple` takes `{ "identityToken" }`. `401` on an invalid token, `409` when the identity is taken. `DELETE` on either unlinks.
- `GET /api/v1/{locale}/users/me/telegram` — `{ "connected": true }`. The chat ID itself is never returned.
- `POST /api/v1/{locale}/users/me/telegram/link-token` — `{ "token", "deepLink": "https://t.me/<bot>?start=<token>", "expiresInSeconds": 600 }`. The frontend opens the deep link and polls the status endpoint until it flips. `503` when no bot is configured on the server.
- `DELETE /api/v1/{locale}/users/me/telegram` — `{ "disconnected": true }`.

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
- `GET /api/v1/{locale}/workspaces/{publicId}/dashboard/trends?days=14` — rolling-window series behind the dashboard charts. `days` is clamped to 1–30; the query actually reaches back `2 × days` so the previous-period deltas have a baseline. Scoped exactly like `/attendances/summary`: owners and managers with `manage_attendance` get the whole workspace, everyone else gets only their own history.
  ```json
  {
    "from": "2026-05-29", "to": "2026-06-11", "days": 14,
    "daily": [{ "date": "2026-06-11", "dayOfWeek": 4, "onTime": 7, "late": 1, "leave": 1, "absent": 2, "closed": false, "expected": 10, "attendanceRate": 80, "onTimeRate": 88 }],
    "byWeekday": [{ "dayOfWeek": 1, "onTime": 12, "late": 2, "absent": 1, "present": 14, "onTimeRate": 86, "hasData": true }],
    "topLate": [{ "employeePublicId": "...", "employeeName": "Dara Sok", "late": 4, "present": 12, "absent": 1, "lateRate": 33 }],
    "totals": { "onTime": 90, "late": 8, "leave": 4, "absent": 12, "present": 98, "expected": 110, "attendanceRate": 89, "onTimeRate": 92, "previousAttendanceRate": 84, "previousOnTimeRate": 90 }
  }
  ```
- `POST /api/v1/{locale}/workspaces/{publicId}/logo` — `multipart/form-data` with a `file` field (owner only). Returns `{ publicId, logoUrl }`. `DELETE` the same path removes it (`logoUrl` comes back `null`).
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
- `POST /api/v1/{locale}/workspaces/{publicId}/employees/{publicId}/photo` — `multipart/form-data` with a `file` field. Owner or a manager with `manage_employees` (workspace-scoped — per-QR managers cannot). Returns the updated `EmployeeDTO`; `DELETE` on the same path clears `photoUrl`.

## Media uploads

Three endpoints accept `multipart/form-data` with a single `file` field instead of JSON — user avatar, workspace logo, and employee photo. All three return the owning resource with the resolved public URL (`avatarUrl` / `logoUrl` / `photoUrl`), and all three accept `DELETE` on the same path to clear the image. Uploads must be JPEG, PNG, or WebP and ≤ 5 MB; `AvatarImageProcessor` re-encodes every accepted file to a 512×512 JPEG (PNG/WebP transparency is flattened), so EXIF and the original encoding never reach disk. `400` with a message when the file is missing, too large, or not an accepted type.

- `POST` / `DELETE /api/v1/{locale}/users/me/avatar` → `UserDTO`
- `POST` / `DELETE /api/v1/{locale}/workspaces/{publicId}/logo` → `{ publicId, logoUrl }`
- `POST` / `DELETE /api/v1/{locale}/workspaces/{publicId}/employees/{publicId}/photo` → `EmployeeDTO`

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

### Per-day time rules (Espresso)

Nested under a shift. Reads only need `VIEW`; every write needs `MANAGE_SHIFTS` **and** the Espresso plan (`402` otherwise). A rule row is `{ "publicId", "dayOfWeek", "dayOfWeekLabel", "startTime", "endTime" }`.

- `GET /api/v1/{locale}/workspaces/{publicId}/shifts/{shiftPublicId}/time-rules` — list.
- `POST` the same path — body `{ "dayOfWeek": 1..7, "startTime": "HH:MM", "endTime": "HH:MM" }`. `201`. An out-of-range `dayOfWeek` is a `400`.
- `PUT /api/v1/{locale}/workspaces/{publicId}/shifts/{shiftPublicId}/time-rules/{rulePublicId}` — body may carry `startTime` and/or `endTime`; the day is fixed at creation.
- `DELETE` the same path — `204`.

Remember the semantics: once a shift has **any** rule it is treated as that shift's complete schedule, and days without a rule become off-days. Deleting the last rule returns the shift to "default times, every day."

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

## Sub-QR codes (authenticated, Double Espresso)

Additional QR codes ("sub-QRs") on top of the workspace's main `qrToken` — one per entrance, station, or branch, each with its own check-in rules and employee roster. Listing/reading needs `VIEW`; creating, editing, and deleting are **owner-only** (`WorkspaceVoter::EDIT`/`DELETE` on a `Workspace`-owned subject). Creating returns `402` when the plan isn't Double Espresso.

```json
{
  "publicId": "...", "qrToken": "...", "name": "Kitchen door",
  "manager": { "publicId": "...", "name": "Dara Sok" },
  "assignedEmployees": [{ "publicId": "...", "name": "Sokha Pen" }],
  "inheritIpSettings": true, "ipRestrictionEnabled": false, "allowedIps": null,
  "inheritGeofencing": false, "geofencingEnabled": true,
  "geofencingLatitude": 11.55, "geofencingLongitude": 104.92, "geofencingRadiusMeters": 80,
  "inheritDeviceVerification": true, "deviceVerificationEnabled": false,
  "createdAt": "2026-06-01T09:00:00+00:00", "updatedAt": "2026-06-01T09:00:00+00:00"
}
```

- `GET /api/v1/{locale}/workspaces/{publicId}/qr-codes` — list.
- `POST` the same path — body `{ "name", "managerPublicId"?, "assignedEmployeePublicIds"?: [], plus any of the inherit/override fields }`. `201`. `422` when the name is empty, the manager isn't an employee of this workspace or has no linked user, or an assigned employee belongs elsewhere.
- `GET /api/v1/{locale}/workspaces/{publicId}/qr-codes/{qrCodePublicId}` — single QR code.
- `PATCH` the same path — partial update of the same fields; `422` on the same validation failures.
- `DELETE` the same path — `204`. Historical attendance keeps its rows (the `qrCode` FK is `ON DELETE SET NULL`).

The three `inherit*` flags each govern one cluster — IP restriction, geofencing, device verification. When a flag is true the parent `WorkspaceSetting` value wins and the sibling override fields are ignored. Timezone is always inherited and cannot be overridden. In the UI this is worded as "Same as workspace" vs custom rules — never "inherit"/"override".

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

## Feature flags (public)

- `GET /api/v1/{locale}/features?workspaceId=` — resolved state of every platform feature flag. Without `workspaceId` (anonymous visitors, marketing pages) only release-stage flags come back enabled.
  ```json
  {
    "flags":  { "nfc_checkin": true, "nfc_writer": false },
    "stages": { "nfc_checkin": "release" }
  }
  ```
  `flags` lists every known flag; `stages` is deliberately restricted to the flags this workspace can actually see — naming the stage of a hidden flag would leak its existence. The frontend pairs the boolean with the stage to render an "Alpha" / "Beta" badge. See [architecture.md](./architecture.md#feature-flags--testing-tracks) for how stage and `Workspace.testingTrack` combine.

## Support (public)

- `GET /api/v1/support/config` — `{ "feedbackEnabled": true }`. Only the boolean crosses the wire, never the SupportDock key. The legacy SPA reads this from `window.__DAILYBREW__` instead; Next.js serves its own HTML and so asks here.
- `GET /api/v1/support/faqs` — FAQ entries proxied from SupportDock.
- `POST /api/v1/support/feedback` — body `{ "type": "bug"|"feature"|"question"|"general", "message", "name"?, "email"?, "subject"?, "source": "website"|"console", "page"?, "images"?: string[] }`. Up to 3 images, each a `data:image/(png|jpeg|webp|gif);base64,` URL. Returns `{ "submitted": true }`, or `502` when SupportDock rejects the relay. **Always call this rather than SupportDock directly** — the browser can't reach supportdock.io (CORS).

## Webhooks (public)

- `POST /api/v1/webhooks/paddle` — Paddle subscription lifecycle webhook (signature-verified).
- `POST /api/v1/webhooks/telegram?secret=` — Telegram bot updates. The `secret` query parameter is compared with `hash_equals` against the configured webhook secret; a mismatch (or an unconfigured secret) is rejected. Handles `/start <token>` (links the chat to a user or a workspace — both token shapes are signed with the app secret, and the `user:` prefix is part of the signed payload so only one verify call can accept a given token), `/chatid`, and `/help`.
- `POST /api/v1/webhooks/mailgun/inbound` — inbound email → SupportDock feedback, posted by Mailgun as multipart form data. HMAC-verified via `timestamp`/`token`/`signature` (`403` on mismatch; verification is skipped when no signing key is configured). An empty body short-circuits to `{ "received": true, "skipped": "empty body" }`; the feedback type is inferred from the subject line.

## Dev (dev environment only)

- `POST /api/v1/dev/toggle-plan` — body `{ "workspacePublicId", "plan": "free"|"espresso"|"double_espresso" }`. Flips a workspace's plan without Paddle so plan gates can be exercised locally. `403` outside the dev environment. (In production the equivalent is the super-admin-only `PUT /admin/workspaces/{publicId}/plan`.)

## Platform admin (authenticated, `ROLE_SUPER_ADMIN`)

Internal staff endpoints under `/api/v1/{locale}/admin`, backing the `/admin/*` console. Every route requires `ROLE_SUPER_ADMIN` — there is no per-workspace scoping here, which is exactly why the role is bootstrapped only through the CLI (`php bin/console dailybrew:admin:promote-user <email>`) and every mutation is written to the audit log. Mutating endpoints call `AdminAuditService::record()`, which is wrap-and-log: an audit failure is swallowed rather than rolling back the action it describes.

List endpoints share a pagination envelope — `{ "items": [...], "page": 1, "pageSize": N, "total": N }` — with `pageSize` 25 (workspaces, users, subscriptions) or 50 (audit log).

### Dashboard

- `GET /admin/dashboard` — platform-wide counters and 30-day series.
  ```json
  {
    "totals": { "users": 412, "workspaces": 118, "employees": 940, "attendances": 51230, "subscriptions": 37 },
    "activation": { "workspacesTotal": 118, "workspacesWithEmployees": 96, "workspacesWithAttendance": 74, "workspacesActiveLast7d": 51 },
    "byPlan": { "free": 81, "espresso": 30, "double_espresso": 7 },
    "churn": {
      "series": [{ "month": "2026-08", "paidCanceled": 1, "workspacesDeleted": 2, "usersDeleted": 3 }],
      "paidCanceledLast30d": 2, "workspacesDeletedLast30d": 3, "usersDeletedLast30d": 4, "livePaid": 37, "paidChurnRateLast30d": 5.1
    },
    "byStatus": { "active": 34, "trialing": 3, "past_due": 0, "paused": 0, "canceled": 12 },
    "growth": { "usersLast7d": 9, "usersLast30d": 41, "workspacesLast7d": 3, "workspacesLast30d": 14, "employeesLast7d": 22, "employeesLast30d": 88, "attendancesLast7d": 1840, "attendancesLast30d": 7900 },
    "growthSeries": [{ "date": "2026-05-13", "users": 2, "workspaces": 1, "employees": 4, "attendances": 260 }],
    "recentSignups": [{ "publicId": "...", "email": "...", "fullName": "...", "createdAt": "..." }],
    "recentWorkspaces": [{ "publicId": "...", "name": "...", "owner": { "publicId": "...", "email": "..." }, "createdAt": "..." }],
    "recentActivity": [{ "publicId": "...", "action": "promote_user", "actionLabel": "Promoted user", "actorEmail": "...", "targetType": "user", "targetPublicId": "...", "targetLabel": "...", "createdAt": "..." }]
  }
  ```
  `churn` is a narrowed view of the churn endpoint — the same 12-month series and the same `churned ÷ (churned + live)` rate, without the timeline or at-risk list, so the dashboard stays cheap and can't tell a different story from `/admin/churn`.

  Two counting rules are worth knowing: `byPlan.free` is *derived* (active workspaces minus those on an active paid plan) because Free workspaces have no subscription row, and `totals.subscriptions` excludes `canceled` rows — those are tombstones, often from deleted workspaces, and would inflate the live count. `activation` is a strict funnel: each step is a subset of the one above it.

### Workspaces

- `GET /admin/workspaces?page=&search=&plan=&includeDeleted=` — `search` matches workspace name or owner email; `plan=free` matches "no subscription **or** a free-plan subscription"; `includeDeleted=1` surfaces soft-deleted rows. Each item: `{ publicId, name, owner{publicId,email,fullName}, plan, subscriptionStatus, currentPeriodEnd, isTrialing, employeeCount, lastActivityDate, createdAt, deletedAt, testingTrack }`.
- `GET /admin/workspaces/{publicId}` — detail, adding an `activity` block (`lastActivityDate`, `attendancesTotal`, `attendancesLast7d`, `attendancesLast30d`, `linkedEmployeeCount`, `managerCount`), the full `subscription` object (including `paddleCustomerId`), a thin `settings` summary, and `qrCodeCount`. `linkedEmployeeCount` vs `employeeCount` is the onboarding drop-off: an employee with no linked user cannot check in at all.
- `POST /admin/workspaces/{publicId}/restore` — undoes a soft-delete and un-deletes the workspace's employees. `409` when the workspace isn't deleted. Employee→user links severed at delete time stay severed — the owner re-links manually. Returns `{ publicId, deletedAt: null, restoredEmployees }`.
- `POST /admin/workspaces/{publicId}/cancel-subscription` — force-cancels locally (and in Paddle where applicable). `409` when there's no subscription. Returns `{ status, canceledAt }`.
- `PUT /admin/workspaces/{publicId}/plan` — body `{ "plan": "free"|"espresso"|"double_espresso" }`. Comps a workspace onto a plan without Paddle, creating the `Subscription` row if needed. **`409` when a Paddle subscription is attached** — billing's source of truth stays in Paddle, and a local override would fight the webhooks. Returns `{ publicId, plan }`.
- `PUT /admin/workspaces/{publicId}/testing-track` — body `{ "track": "none"|"alpha"|"beta" }`. Opts the workspace into early access for feature-flagged surfaces. Returns `{ publicId, testingTrack }`.

### Users

- `GET /admin/users?page=&search=&superAdminOnly=` — `search` matches email, first, or last name. Items carry `{ publicId, email, fullName, firstName, lastName, isSuperAdmin, hasGoogle, hasApple, hasPassword, createdAt }`.
- `GET /admin/users/{publicId}` — adds `locale`, `onboardingCompleted`, `updatedAt`, `ownedWorkspaces[]` (**including soft-deleted**, each with `deletedAt`) and `linkedWorkspaces[]`.
- `POST /admin/users/{publicId}/promote` — grants `ROLE_SUPER_ADMIN`; `409` if already held. Returns `{ "isSuperAdmin": true }`.
- `POST /admin/users/{publicId}/demote` — revokes it. `400` on self-demotion (so the last admin can't lock everyone out by accident), `409` when the user isn't a super admin.

### Subscriptions, churn, audit log

- `GET /admin/subscriptions?page=&status=&plan=` — paginated subscriptions with their workspace and owner, plus `isActive`, `isTrialing`, `trialDaysRemaining`, `currentPeriodEnd`, `trialEndsAt`, `canceledAt`, `paddleSubscriptionId`.
- `GET /admin/churn?days=30|90|365&page=` — churn analytics (`days` defaults to 90). Anything outside the three options silently falls back to the default rather than `400`ing — it's a dashboard, and a stale bookmark shouldn't blank the page.
  ```json
  {
    "windowDays": 30,
    "summary": {
      "paidChurned": 4, "paidChurnedLast30d": 2, "livePaid": 37,
      "paidChurnRate": 9.8, "paidChurnRateLast30d": 5.1,
      "workspacesDeleted": 6, "workspacesDeletedLast30d": 3, "liveWorkspaces": 118,
      "workspaceChurnRate": 4.8,
      "usersDeleted": 9, "usersDeletedLast30d": 4, "liveUsers": 403, "userChurnRate": 2.2,
      "avgLifetimeDays": 142
    },
    "series": [{ "month": "2026-06", "paidCanceled": 1, "workspacesDeleted": 2, "usersDeleted": 3 }],
    "events": { "items": [{ "id": "ws-...", "type": "workspace_deleted", "occurredAt": "...", "workspace": {...}, "owner": {...} }], "page": 1, "pageSize": 25, "total": 6 },
    "dormant": [{ "publicId": "...", "name": "...", "ownerEmail": "...", "plan": "espresso", "lastActivity": "2026-05-02", "daysQuiet": 40 }],
    "dormantAfterDays": 21
  }
  ```
  Three overlapping shapes are tracked: **paid churn** (`Subscription.canceledAt` on a non-free plan — lost revenue), **workspace churn** (`Workspace.deletedAt` — lost account) and **user churn** (`User.deletedAt` — lost person, including employees and managers who never owned a workspace). They cascade — deleting an account deletes its workspaces, deleting a workspace cancels its subscription — so all three counters see the same departure, but the timeline emits **one event per churned thing**: a workspace deletion carries the plan it was on rather than producing a second `subscription_canceled` row, and a `user_deleted` event is emitted only when no workspace of that user's was deleted in the window. A `user_deleted` event carries `workspace: null` and `plan: null`; its `owner.email` is the sign-up address, with the `_deleted_…` suffix that account deletion adds stripped for display. Rates are `churned ÷ (churned + still live)`; there's no historical subscription snapshot to use as a true period-start denominator. `dormant` lists paying accounts with no check-in for 21+ days, excluding never-active ones (that's activation, which the dashboard funnel covers).
- `GET /admin/audit-log?page=&action=&targetType=` — newest-first admin actions. Alongside `items`, the response carries `actions[]` and `targetTypes[]` (`{ value, label }` pairs straight from the enums) so the admin dropdowns can't drift out of sync with the backend. Each item: `{ publicId, action, actionLabel, actor{publicId,email}|null, actorEmail, targetType, targetPublicId, targetLabel, metadata, createdAt }` — `actorEmail` and `targetLabel` are snapshots taken at write time, so a row stays readable after the actor or target is deleted.

### Feature flags & mobile app config

- `GET /admin/feature-flags` — every `FeatureFlagEnum` case with its current stage, plus the `stages[]` catalog (`{ value, label, description }`). Items: `{ key, label, description, stage, stageLabel }`.
- `PUT /admin/feature-flags/{flagKey}` — body `{ "stage": "dev"|"alpha"|"beta"|"release" }`. Creates the row on first write and flushes the service cache. `404` on an unknown flag, `400` on an invalid stage.
- `GET /admin/mobile-app-config` — `{ iosTeamId, iosBundleId, androidPackage, androidSha256Fingerprints[], iosConfigured, androidConfigured }`. Backs the `/.well-known` association files for iOS universal links and Android App Links.
- `PUT /admin/mobile-app-config` — partial update of the four editable fields; blank strings clear a field, and Android fingerprints are upper-cased and de-blanked. Audited.

### Cron

Surfaces the `dukecity/command-scheduler` store through the React admin console (the bundle's own Twig panel is deliberately not exposed). Every write path validates the command against `CronJobRegistry` — defence in depth on top of the bundle's namespace filter, narrowing to the specific commands that are safe to schedule from a UI.

- `GET /admin/cron/jobs` — the allowlist for the command picker: `[{ command, label, description, suggestedCron }]`.
- `GET /admin/cron/schedules` — schedules ordered enabled-first, each as `{ id, name, command, arguments, cronExpression, cronExpressionTranslated, disabled, locked, executeImmediately, priority, lastExecution, lastReturnCode, nextRunDate, lastRun }`.
- `POST /admin/cron/schedules` — body `{ command, name, cronExpression, arguments?, priority?, disabled? }`. `201`. `400` when the command isn't allowlisted or name/expression are blank.
- `PATCH /admin/cron/schedules/{id}` — partial update of the same fields (this is also how a schedule is enabled/disabled).
- `DELETE /admin/cron/schedules/{id}` — `{ "deleted": true }`.
- `POST /admin/cron/schedules/{id}/run` — runs the command immediately, in-process, so `CronRunSubscriber` records an `AdminCronRun` row and captures the output tail. Returns `{ exitCode, startedAt, finishedAt, outputTail }`; the run is attributed to the triggering admin.
- `GET /admin/cron/runs?command=&limit=` — run history for one command (`command` required, `limit` clamped to 1–100, default 20). Each run: `{ publicId, command, startedAt, finishedAt, status, exitCode, outputTail, triggeredByEmail }`.

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
      "publicId": "ab3k9mnp7qrs",
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

Each employee carries two identifiers: `username` (the owner-assigned, **mutable** linking key the feed is keyed by) and `publicId` (DailyBrew's **stable, immutable** public employee ID — not the internal DB id). Match on `username` for the initial import, then key off `publicId` for subsequent syncs so a later rename doesn't orphan accumulated history.

See [basilbook.md](./basilbook.md) for the full field reference, the identifier/linking model, and token lifecycle.
