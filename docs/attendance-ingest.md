# Attendance ingest API

Lets an external system *write* attendance — a turnstile, a POS, another HR tool — over a signed
request. The read side (the BasilBook pull) is documented in [docs/basilbook.md](./basilbook.md) and is
unchanged: bearer key, no signature.

**Espresso and above. Requires an API token carrying the `attendance:write` scope, minted from
Settings → API keys.**

## Why signing, and why the token can't be the key

Today's external surface is one read-only endpoint authenticated by a bearer token: the client sends
`X-Api-Key: db_…`, the server hashes it with SHA-256 and looks the digest up in `daily_brew_api_tokens`.
For a read that's proportionate. The exposure is that the secret itself travels on every request, so
anyone who captures one — a leaked log, a debugging proxy, a key pasted into a chat — can replay it
until somebody notices and revokes it. On a write path that stops being an acceptable trade: a captured
request can be replayed to forge attendance, and attendance is what payroll is reconciled against.

Signing fixes both halves. The secret stops travelling (only a key id and a signature do), and a
captured request expires.

**The non-obvious constraint:** we cannot sign with the API token itself. The server stores only
`sha256(token)` — by design, so a database dump yields nothing usable — which means it cannot recompute
an HMAC keyed by the plaintext token. Signing therefore needs a *second* secret that the server can
recover, stored encrypted rather than hashed. That is a real reduction in at-rest safety versus the
token digest, and it's the price of request signing. Encrypt it (below) so a DB dump alone still isn't
enough; an attacker needs the database *and* the deploy environment.

## Wire format

```http
POST /api/v1/integrations/attendances HTTP/1.1
Host: dailybrew.work
Content-Type: application/json
X-DB-Key-Id: 7fk2mqx9r4tp
X-DB-Timestamp: 1786012800
X-DB-Nonce: 9f2c1a7b45de8103
X-DB-Signature: v1=6b1e…c4

{"employeePublicId":"m4rt2wq8xkph","date":"2026-08-12","checkInAt":"08:57","checkOutAt":"17:04","reason":"Turnstile sync"}
```

- `X-DB-Key-Id` — `ApiToken.publicId`. Not a secret; it selects which key verifies the signature.
- `X-DB-Timestamp` — Unix seconds. Rejected beyond **±300s** of server time.
- `X-DB-Nonce` — ≥16 chars, unique per key within the skew window.
- `X-DB-Signature` — `v1=` + lowercase hex HMAC-SHA256. The version prefix exists so a future `v2`
  scheme can roll out without breaking `v1` clients mid-flight.

Signed string — newline-joined, in this exact order:

```
v1
{timestamp}
{nonce}
{METHOD}
{path}                     ← path only, no query string, no host
{sha256(raw body) as hex}  ← sha256("") for a bodyless request
```

Hashing the body rather than including it keeps the signing input bounded and sidesteps every
canonical-JSON argument: the client signs the exact bytes it sends, and the server verifies against the
exact bytes it received (read the raw body *before* anything deserialises it).

Verification order, all failures returning `401` with a generic message:

1. Look up the key by `X-DB-Key-Id`; reject if unknown, revoked, or its workspace is deleted.
2. Reject timestamp skew > 300s. Do this before any crypto — it's the cheapest filter.
3. Recompute the HMAC and compare with `hash_equals()`. Never `===`.
4. Reject a nonce already seen for this key.

Only then does authorization run (scope, plan, workspace), and only then is the body parsed. **Never
report which check failed** — "invalid signature" for all four. A caller that can distinguish "unknown
key" from "bad signature" from "replayed nonce" has been handed an oracle.

### Nonce store

A cache pool (`integration.nonce.cache`) keyed `integration_nonce.{keyId}.{sha256(nonce)}`, TTL 600s —
twice the skew window, so a nonce outlives every request that could still be valid. The check is
read-then-write rather than an atomic compare-and-set: PSR-6 has no CAS, and the window that leaves is
two identical requests inside the same few milliseconds, which the unique `(employee, date)` constraint
already stops from landing twice.

Not `bangkeut/tap-core`'s `NonceStore`, despite the name: there the *terminal* issues the nonce and the
holder signs it back (challenge–response). Here the client picks its own nonce and the server only
checks it hasn't been used, which is a replay cache, not a challenge. Same word, opposite direction.

The app cache is filesystem-backed by default, and [atomic deploys](../deploy/CUTOVER.md) swap the
release directory, so a deploy would empty the nonce store and briefly widen the replay window to the
300s skew. Either point the pool at `shared/` or give it Redis. Worth one line of config; not worth
pretending the default is fine.

## Authentication and authorization

**Scopes.** `ApiToken.scopes` is a JSON list of `attendance:read` / `attendance:write`. Tokens that
predate scopes were back-filled to `['attendance:read']` — no key that already existed acquires write
access through a migration. The ingest endpoint requires `attendance:write`; the BasilBook pull requires
`attendance:read`.

**Signing secret.** `ApiToken.signingSecret` holds 32 random bytes encrypted with
`sodium_crypto_secretbox` under `API_TOKEN_ENCRYPTION_KEY`. Returned in plaintext exactly once, at mint,
next to the token itself. There is no recovery path — a lost secret is re-minted, like the token. Tokens
minted before signing existed have none and can never sign.

**Firewall.** `ApiTokenAuthenticator` (formerly `BasilBookApiKeyAuthenticator`) covers
`^/api/v1/(basilbook|integrations)`. It accepts either scheme, resolves the workspace and the token onto
the request, and marks whether the request was signed. A signature wins over a bearer header when both
are present, so a caller can't downgrade itself. `basilbook` routes are unchanged; the vendor-neutral
prefix is where anything new lands, because the same ingest serves a turnstile as well as BasilBook.

**Signature required only for writes.** Reads keep bearer auth, so no existing integration breaks. A
signed request may omit `X-Api-Key` entirely — that's the point, and the ingest endpoint refuses an
unsigned request even from a key that holds `attendance:write`.

## Endpoint

`POST /api/v1/integrations/attendances`

| Field               | Required | Notes                                                                 |
| ------------------- | -------- | --------------------------------------------------------------------- |
| `employeePublicId`  | one of   | Stable immutable id. Preferred.                                        |
| `username`          | one of   | The BasilBook link key. Mutable — accepted, but `employeePublicId` wins if both are sent. |
| `date`              | yes      | `YYYY-MM-DD`, workspace-local calendar date.                           |
| `checkInAt`         | yes      | `HH:MM`, workspace-local.                                              |
| `checkOutAt`        | no       | `HH:MM`, workspace-local. Must be ≥ `checkInAt` — **unless the employee's shift for that date runs past midnight**, see [Overnight shifts](#overnight-shifts). |
| `reason`            | yes      | ≤255 chars. Lands in the audit trail; make the client send something meaningful, e.g. `"Turnstile #3"`. |

Times stay workspace-local `HH:MM` rather than ISO-8601 instants so the whole thing reuses
`AttendanceService::create` unchanged — the same validation the console goes through (future dates
rejected, check-out ≥ check-in, flags recomputed through `AttendanceFlagCalculator`, voided rows
resurrected in place). A machine client would arguably prefer an instant; that's a `v2` field, not a
reason to fork the validation.

### Overnight shifts

A turnstile at a bar sends `{"date": "2026-08-12", "checkInAt": "18:00", "checkOutAt": "02:00"}`.
That check-out is on the 13th, and the record is still filed under the 12th — the day the shift
started, which is the day the work is credited to.

Send the clock times as they were read. The service rolls the check-out onto the following day when
the employee's shift **for that date** crosses midnight, and rejects it as a backwards range when the
shift does not — a day-shift employee with a `02:00` check-out is a bug in the sending system, not a
night. There is no `checkOutNextDay` input field: the shift is the authority, so a client can't
declare a 26-hour day by mistake. The pull feed *does* return `checkOutNextDay` on the way out (see
[basilbook.md](./basilbook.md#overnight-shifts)).

Consequence worth knowing: an employee with **no shift assigned** cannot have an overnight day
ingested — there is nothing to infer overnight-ness from, so the `422` stands. Assign the shift
first.

Employee resolution: must belong to the token's workspace and not be soft-deleted, else `404`.

**Responses**

| Code | Meaning                                                                                   |
| ---- | ----------------------------------------------------------------------------------------- |
| 201  | Created (or a voided row resurrected in place).                                             |
| 401  | Signature, skew, nonce, or unknown/revoked key. Deliberately indistinguishable.             |
| 403  | Missing `attendance:write` scope, or workspace below Espresso.                              |
| 429  | Rate limit exceeded (120/minute per key), with `Retry-After`.                               |
| 404  | Employee not found in this workspace.                                                       |
| 409  | A live attendance already exists for `(employee, date)` — body carries the existing record, matching `AttendanceAlreadyExistsException` and the console's behaviour. |
| 422  | Validation failure, with the offending field named.                                         |

`409` rather than a silent upsert is the deliberate choice: an integration that re-sends the same day
should be told it already recorded it, not quietly overwrite times someone may have corrected by hand.
A client that genuinely wants to overwrite can `PATCH` the returned record — the same route the console
takes.

## Audit trail

`Attendance` audit fields assume a human: `editedBy` is a `User` FK and `editedByEmail` its snapshot.
An API write has no user, and borrowing the workspace owner's identity would put a name on something
they didn't do.

Introduce a small `AuditActor` value object — `AuditActor::forUser(User)` / `AuditActor::forApiToken(ApiToken)`
— and take it in `AttendanceService::create()` and `::override()` in place of `User $actor`. For a token
it leaves `editedBy` null and writes `editedByEmail` as `api-token:{name}` (the column is already a
snapshot string, so no schema change). The UI's existing "Edited" pill then reads
`api-token:Turnstile production` instead of an email, which is exactly the truth.

## Signing a request

PHP:

```php
$secret    = 'dbs_…';                 // shown once, at mint
$keyId     = '7fk2mqx9r4tp';          // the token's publicId
$path      = '/api/v1/integrations/attendances';
$body      = json_encode(['employeePublicId' => 'm4rt2wq8xkph', 'date' => '2026-08-12',
                          'checkInAt' => '08:57', 'reason' => 'Turnstile #3']);
$timestamp = time();
$nonce     = bin2hex(random_bytes(8));

$canonical = implode("\n", ['v1', $timestamp, $nonce, 'POST', $path, hash('sha256', $body)]);
$signature = 'v1=' . hash_hmac('sha256', $canonical, $secret);
```

Node:

```js
const crypto = require("crypto");
const canonical = ["v1", timestamp, nonce, "POST", path,
  crypto.createHash("sha256").update(body).digest("hex")].join("\n");
const signature = "v1=" + crypto.createHmac("sha256", secret).update(canonical).digest("hex");
```

Send `body` byte-for-byte as signed — re-serialising the JSON between signing and sending changes the
hash and the request will 401.

## Where it lives

| Piece | File |
| ----- | ---- |
| Scheme (canonical string, HMAC, constant-time compare) | `src/Service/Integration/RequestSignature.php` |
| Verification (skew, signature, replay) | `src/Service/Integration/SignedRequestVerifier.php` |
| Secret encryption | `src/Service/Integration/SecretCipher.php` |
| Minting | `src/Service/Integration/ApiTokenMinter.php` |
| Auth (bearer + signed) | `src/Security/ApiTokenAuthenticator.php` |
| Endpoint | `src/ApiController/Integration/AttendanceController.php` |
| Actor abstraction | `src/Service/AuditActor.php` |

## Operational notes

- **`API_TOKEN_ENCRYPTION_KEY`** — 32 base64 bytes (`openssl rand -base64 32`). Left empty, the key is
  derived from `APP_SECRET` via HKDF so a fresh deployment works out of the box; the cost is that
  rotating `APP_SECRET` invalidates every signing secret and those tokens must be re-minted.
- **Nonce pool** — `integration.nonce.cache`, filesystem-backed by default. An atomic deploy swaps the
  release directory and empties it, briefly widening the replay window to the 300s skew. Point it at
  Redis on a host that cares.
- **Rate limit** — `api_ingest`, 120/minute per key (not per IP: one integration behind a NAT
  shouldn't be able to spend another's budget).
- **Existing tokens** — back-filled to `attendance:read` with no signing secret. They keep pulling and
  can never write; granting write means minting a new token.

## Deliberately out of scope

- **Bulk ingest.** One record per request until somebody has a volume problem. A batch endpoint needs
  partial-failure semantics, which is a design of its own.
- **Check-out as a separate call.** `PATCH` on the created record already covers it.
- **Signing the read endpoint.** It would be strictly better, but it breaks a live integration for a
  read that leaks nothing an attacker couldn't get by replaying the bearer token anyway. Revisit when
  BasilBook next ships a client update.
- **Webhooks out.** Push *from* DailyBrew is the mirror image of this and shares the signing code, but
  nobody has asked for it.
