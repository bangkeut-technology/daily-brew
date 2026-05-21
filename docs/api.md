# API Reference

Most routes live under `/api/v1/{locale}` where `{locale}` is `en`, `fr`, or `km` — the locale picks the response language for validation messages and translatable content. Two route families bypass the locale prefix because they're called by mobile apps or external systems where locale doesn't apply: QR check-in (`/api/v1/checkin/...`) and device token registration (`/api/v1/devices/...`).

Authentication is JWT (issued at login or OAuth callback, sent as the `BEARER` cookie) for everything tagged "authenticated". The BasilBook external API is the only exception — it uses the `X-Api-Key` header instead of JWT. Public routes (auth, webhooks, support) require no credentials.

## Auth (public)

- `POST /api/v1/{locale}/auth/login`
- `POST /api/v1/{locale}/auth/register`
- `POST /api/v1/{locale}/auth/google`
- `POST /api/v1/{locale}/auth/apple`
- `POST /api/v1/{locale}/auth/logout` — invalidates the session, expires the `BEARER` + `refresh_token` cookies, **and deletes the refresh-token DB row** (read from cookie, falls back to JSON body `{ "refresh_token": "..." }` for mobile). Idempotent — no-op when the token is absent or already gone.
- `POST /api/token/refresh` — **outside the `/v1` prefix**. Body: `{ "refresh_token": "..." }`. Returns `{ "token": "<new JWT>", "refresh_token": "<rotated token>" }`. `single_use: true` means every successful refresh deletes the consumed token and mints a new one; clients MUST persist the rotated `refresh_token` from the response. Scoped to its own `token_refresh` firewall (ahead of `^/api`) so the JWT cookie authenticator can't intercept — see CLAUDE.md "Refresh-token firewall" for the iOS-specific reason.

## Workspaces (authenticated)

- `GET/POST /api/v1/{locale}/workspaces`
- `GET/PUT/DELETE /api/v1/{locale}/workspaces/{publicId}`
- `GET/PUT /api/v1/{locale}/workspaces/{publicId}/settings`
- `GET /api/v1/{locale}/workspaces/{publicId}/dashboard`
- `GET /api/v1/{locale}/workspaces/{publicId}/plan`

## Resources (authenticated, scoped to workspace)

- `GET/POST /api/v1/{locale}/workspaces/{publicId}/employees`
- `PUT /api/v1/{locale}/workspaces/{publicId}/employees/{publicId}` — update employee fields, including `role` for owner-only manager promotion/demotion. Promoting seeds `managerPermissions` with the defaults `[manage_leave, manage_attendance]` when the field is empty; demoting clears it.
- `PATCH /api/v1/{locale}/workspaces/{publicId}/employees/{publicId}/manager-permissions` — set the manager's permission list (owner only). Body: `{ "permissions": ["manage_employees", "manage_shifts", "manage_closures", "manage_leave", "manage_attendance"] }`. Unknown values are rejected.
- `GET/POST /api/v1/{locale}/workspaces/{publicId}/shifts`
- `GET/POST /api/v1/{locale}/workspaces/{publicId}/closures`
- `GET/POST /api/v1/{locale}/workspaces/{publicId}/leave-requests`
- `DELETE /api/v1/{locale}/workspaces/{publicId}/leave-requests/{publicId}` — cancel leave request (employee: own pending only; owner: any; manager with `manage_leave`: any; per-QR manager: any belonging to an assigned employee)
- `GET /api/v1/{locale}/workspaces/{publicId}/attendances` — owner sees all; manager with `manage_attendance` sees all; otherwise the response is scoped to the caller's own attendance. Present rows include manager-override audit fields (`editedAt`, `editedByEmail`, `editReason`, `originalCheckInAt`, `originalCheckOutAt`) when applicable.
- `PATCH /api/v1/{locale}/workspaces/{publicId}/attendances/{attendancePublicId}` — owner or manager with `manage_attendance` override an existing attendance row. Body: `{ "checkInAt"?: "HH:MM" | null, "checkOutAt"?: "HH:MM" | null, "reason": string }`. Times are workspace-local; reason is required (max 255 chars). First edit snapshots originals (`originalCheckInAt`/`originalCheckOutAt`) so subsequent edits don't lose the raw scan. Late/leftEarly flags recompute via `AttendanceFlagCalculator`. Returns the updated `AttendanceDTO`.
- `GET /api/v1/{locale}/workspaces/{publicId}/settings/my-ip` — returns client IP as seen by server

## API Tokens (authenticated, owner only)

- `GET /api/v1/{locale}/workspaces/{publicId}/api-tokens` — list all tokens
- `POST /api/v1/{locale}/workspaces/{publicId}/api-tokens` — generate token (body: `{ "name": "BasilBook" }`)
- `DELETE /api/v1/{locale}/workspaces/{publicId}/api-tokens/{tokenPublicId}` — revoke token

## QR Check-in (authenticated, no locale)

- `GET /api/v1/checkin/{qrToken}`
- `POST /api/v1/checkin/{qrToken}`

## Device Tokens (authenticated, no locale)

- `POST /api/v1/devices` — register push notification token
- `DELETE /api/v1/devices/{token}` — unregister push notification token

## Webhooks (public)

- `POST /api/v1/webhooks/paddle`

## BasilBook API

External attendance pull for the BasilBook accounting integration. Uses `X-Api-Key` instead of JWT. See [basilbook.md](./basilbook.md) for the request/response spec, plan gating, and limits.
