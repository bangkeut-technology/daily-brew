# BasilBook Integration

BasilBook is an external accounting / POS system. Restaurants that run both DailyBrew and BasilBook can reconcile attendance against sales and labor data by pulling DailyBrew's attendance records into BasilBook on a schedule.

The link is the **Employee `username`** field — the workspace owner sets it on each employee to match the staff name or ID used in BasilBook. The pull endpoint then returns only employees that have a `username` set, keyed by that field, so BasilBook can join records on its own side without DailyBrew exposing any internal IDs. The feature is **Espresso-only** — Free workspaces don't see the API tokens UI and the endpoint returns 403.

Authentication is per-workspace API tokens (`db_` + 45 alphanumeric, SHA-256 hashed at rest, plain token shown once at creation). Tokens are revocable from the workspace settings page; revoking kills BasilBook's access without affecting any other integration or the owner's own login session.

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

## Response fields

| Field | Type | Description |
|-------|------|-------------|
| `workspace` | string | Restaurant name |
| `timezone` | string | IANA timezone — all times formatted in this TZ |
| `from` / `to` | string | Requested date range (YYYY-MM-DD) |
| `employees[].username` | string | BasilBook staff linking key |
| `employees[].name` | string | Employee full name |
| `employees[].shiftName` | string \| null | Assigned shift, or null |
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
- Only employees with a `username` are included
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
