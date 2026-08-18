# BasilBook Integration

BasilBook is an external accounting / POS system. Restaurants that run both DailyBrew and BasilBook can reconcile attendance against sales and labor data by pulling DailyBrew's attendance records into BasilBook on a schedule.

The link is the **Employee `username`** field — the workspace owner sets it on each employee to match the staff name or ID used in BasilBook. The pull endpoint returns **all active employees** in the workspace, including those without a `username` (their `username` is `null`); BasilBook can join the matched ones on `username` and reconcile the rest on the stable `publicId`. The feature is **Espresso-only** — Free workspaces don't see the API tokens UI and the endpoint returns 403.

Authentication is per-workspace API tokens (`db_` + 45 alphanumeric, SHA-256 hashed at rest, plain token shown once at creation). Tokens are revocable from the workspace settings page; revoking kills BasilBook's access without affecting any other integration or the owner's own login session.

Tokens carry **scopes**. This pull needs `attendance:read`, which every existing token has and which is what a new token gets by default. `attendance:write` is a separate opt-in for the [attendance ingest endpoint](./attendance-ingest.md) — a pull integration should not hold it, and writing additionally requires signing each request with the token's signing secret rather than sending the key.

## Identifiers

Each employee in the response carries two identifiers, and they serve different purposes:

- **`username`** — the human-assigned linking key. The owner types it in to match BasilBook's own staff record, so it's the natural join key on first import. But it's **mutable** (an owner can rename or clear it), **nullable** (an employee may have none — the field is then `null` in the feed), and **not guaranteed unique across time** — if it's reassigned the records would re-key under a different staff member. Clearing it no longer drops the employee from the feed; they stay, joinable on `publicId`.
- **`publicId`** — DailyBrew's **stable, immutable** employee identifier (12 characters from `abcdefghjkmnpqrstuvwxyz23456789`, the same public-ID scheme used everywhere else in the API). It is **not** the internal auto-increment database id — it's a public-facing, non-enumerable token that's safe to expose and never changes for the life of the employee.

**Recommended approach:** match on `username` during the initial import to establish the mapping, then store and key off `publicId` for all subsequent syncs. That way a later username change or typo fix on the DailyBrew side won't orphan or misattribute the history BasilBook has already accumulated.

## Endpoint

```
GET /api/v1/basilbook/attendances?from=YYYY-MM-DD&to=YYYY-MM-DD
Header: X-Api-Key: db_a3xK9mP2nR7bQ4wY8cD1fG6hJ0kL5oU9sT3vX...
```

**Example:**

```bash
curl "https://dailybrew.work/api/v1/basilbook/attendances?from=2026-04-01&to=2026-04-30" \
  -H "X-Api-Key: db_a3xK9mP2nR7bQ4wY8cD1fG6hJ0kL5oU9sT3vX..."
```

**Response:**

```json
{
  "workspace": "The Daily Grind",
  "timezone": "Asia/Phnom_Penh",
  "from": "2026-04-01",
  "to": "2026-04-30",
  "employees": [
    {
      "publicId": "ab3k9mnp7qrs",
      "firstName": "John",
      "lastName": "Doe",
      "name": "John Doe",
      "jobTitle": "Barista",
      "username": "john_doe",
      "active": true,
      "role": "employee",
      "linkedUserPublicId": null,
      "shiftName": "Morning",
      "shiftPublicId": "sh7k2mnp9qrs",
      "dob": "1995-03-12",
      "joinedAt": "2026-01-05",
      "linkedAt": null,
      "leftAt": null,
      "createdAt": "2026-01-05T08:00:00+00:00",
      "managerPermissions": [],
      "attendanceTracking": "full",
      "photoUrl": null,
      "records": [
        {
          "date": "2026-04-01",
          "checkInAt": "08:02",
          "checkOutAt": "17:05",
          "checkOutNextDay": false,
          "isLate": false,
          "leftEarly": false
        }
      ]
    }
  ]
}
```

## Response fields

| Field | Type | Description |
|-------|------|-------------|
| `workspace` | string | Restaurant name |
| `timezone` | string | IANA timezone — all times formatted in this TZ |
| `from` / `to` | string | Requested date range (YYYY-MM-DD) |
| `employees[]` | object | Full employee record — the console's `EmployeeDTO` field set minus the PII the feed omits (`linkedUserEmail`, `phoneNumber`): `firstName`, `lastName`, `name`, `jobTitle`, `active`, `role`, `linkedUserPublicId`, `shiftName`, `shiftPublicId`, `dob`, `joinedAt`, `linkedAt`, `leftAt`, `createdAt`, `managerPermissions`, `attendanceTracking`, `photoUrl`, plus the two keys below |
| `employees[].publicId` | string | Stable, immutable DailyBrew employee ID (12 chars) — preferred long-term join key; see [Identifiers](#identifiers) |
| `employees[].username` | string \| null | Mutable BasilBook staff linking key (the field the owner sets); `null` for employees with no username — join those on `publicId` |
| `employees[].records[]` | array | Attendance entries (absent days omitted) |
| `records[].date` | string | Calendar date (YYYY-MM-DD) |
| `records[].checkInAt` | string \| null | Check-in time (HH:mm in workspace TZ) |
| `records[].checkOutAt` | string \| null | Check-out time (HH:mm in workspace TZ) |
| `records[].checkOutNextDay` | boolean | The check-out happened on the **day after** `date` — an overnight shift. See [Overnight shifts](#overnight-shifts) |
| `records[].isLate` | boolean | Late relative to shift start |
| `records[].leftEarly` | boolean | Left before shift end |

## Rules

- Requires Espresso plan (403 if not)
- Both `from` and `to` are required (YYYY-MM-DD)
- Maximum range: 93 days
- All active employees are included — username-less ones carry `username: null` and are joined on `publicId`; `publicId` is always present and stable across syncs — see [Identifiers](#identifiers)
- Days with no attendance are omitted — absence = missing date
- **Voided rows are omitted too.** When an owner/manager removes a bad attendance row, it is soft-deleted: the row stays in DailyBrew's database for audit, but the feed treats that day as absent, matching what the dashboard counts. A day that disappears between two syncs was voided — re-syncing a range is therefore authoritative, and an integrator should replace the range rather than merge into it.
- `isLate` / `leftEarly` are always `false` if employee has no shift
- **A record can span two calendar days.** See [Overnight shifts](#overnight-shifts) — `checkOutNextDay: true` means `checkOutAt` is a time on `date + 1`.
- If an owner/manager has manually overridden an attendance row, the returned `checkInAt`/`checkOutAt` reflect the **edited values**, not the original scan times (the override represents "what really happened"). Originals stay in the DB for audit but aren't exposed here. The same applies to rows created by hand to backfill a forgotten scan — they appear in the feed like any other record.
- A workspace with no active employees short-circuits to `{ "employees": [], "from": ..., "to": ... }` — note that `workspace` and `timezone` are **absent** from that response, so don't read them unconditionally.

## Overnight shifts

A restaurant whose Shift B runs 18:00–02:00 produces records where the
check-out clock time is *earlier* than the check-in:

```json
{
  "date": "2026-04-10",
  "checkInAt": "18:00",
  "checkOutAt": "02:00",
  "checkOutNextDay": true,
  "isLate": false,
  "leftEarly": false
}
```

The record stays filed under the day the shift **started** — that is the day the
work is credited to, and it is the day DailyBrew's own reports, exports and
absence calculations use. Only one record exists for the night; there is no
matching row on the 11th.

Compute hours as:

```
minutes = (checkOutMinutes + (checkOutNextDay ? 1440 : 0)) - checkInMinutes
```

Subtracting the raw clock times would give **−16 hours** for the example above.
An integrator that ignores `checkOutNextDay` will silently mis-total every night
shift, so treat the flag as required, not optional.

`checkOutNextDay` is always `false` when `checkOutAt` is `null` (still on shift,
or a forgotten scan). It is derived from the stored timestamps, not from the
shift configuration — so it stays correct even if the shift is later edited.

## Errors

| Status | Meaning |
|--------|---------|
| 401 | Missing or invalid API key |
| 403 | Workspace not on Espresso plan |
| 422 | Invalid or missing date parameters |

## Token management

- `GET /api/v1/{locale}/workspaces/{publicId}/api-tokens` — list (active + revoked)
- `POST /api/v1/{locale}/workspaces/{publicId}/api-tokens` — generate (body: `{ "name": "BasilBook production" }`); plain token returned **once**
- `DELETE /api/v1/{locale}/workspaces/{publicId}/api-tokens/{tokenPublicId}` — revoke
