# BasilBook Integration

BasilBook is an external accounting / POS system. Restaurants that run both DailyBrew and BasilBook can reconcile attendance against sales and labor data by pulling DailyBrew's attendance records into BasilBook on a schedule.

The link is the **Employee `username`** field — the workspace owner sets it on each employee to match the staff name or ID used in BasilBook. The pull endpoint returns **all active employees** in the workspace, including those without a `username` (their `username` is `null`); BasilBook can join the matched ones on `username` and reconcile the rest on the stable `publicId`. The feature is **Espresso-only** — Free workspaces don't see the API tokens UI and the endpoint returns 403.

Authentication is per-workspace API tokens (`db_` + 45 alphanumeric, SHA-256 hashed at rest, plain token shown once at creation). Tokens are revocable from the workspace settings page; revoking kills BasilBook's access without affecting any other integration or the owner's own login session.

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
| `records[].isLate` | boolean | Late relative to shift start |
| `records[].leftEarly` | boolean | Left before shift end |

## Rules

- Requires Espresso plan (403 if not)
- Both `from` and `to` are required (YYYY-MM-DD)
- Maximum range: 93 days
- All active employees are included — username-less ones carry `username: null` and are joined on `publicId`; `publicId` is always present and stable across syncs — see [Identifiers](#identifiers)
- Days with no attendance are omitted — absence = missing date
- `isLate` / `leftEarly` are always `false` if employee has no shift
- If an owner/manager has manually overridden an attendance row, the returned `checkInAt`/`checkOutAt` reflect the **edited values**, not the original scan times (the override represents "what really happened"). Originals stay in the DB for audit but aren't exposed here.

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
