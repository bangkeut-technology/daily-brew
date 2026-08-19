# Card check-in

**Status: the server side and the console UI are implemented; the kiosk is not.**
Cards can be issued, revoked and tapped over the API today — see
**Implementation status** below for exactly what exists and what a working
deployment still needs.

A physical card, linked to an employee, tapped against a kiosk at the door. No phone, no account, no
app, no install for the employee.

## Why

Every check-in path DailyBrew ships today needs the employee to be an authenticated user: the QR
flow resolves the employee from the JWT plus the workspace, and NFC check-in is the same flow with
the URL on a sticker instead of a poster. That structurally excludes staff who don't carry a
smartphone on shift — not an edge case in a kitchen, and a segment no amount of polish on the
existing flow can reach.

The data model already allows those employees to exist: `Employee.linkedUser` is nullable, and
owners add staff who never sign in. What's missing is a way for them to *punch*.

A card inverts the direction of trust. The **kiosk** is the authenticated party; the **card** is the
identity claim it presents.

## Naming: this is not "Tap check-in"

`WorkspaceSetting.tapCheckinEnabled`, `PlanService::canUseTapCheckin()` and the "Tap check-in"
settings card already exist and mean something else — an in-app button that lets a signed-in
employee check in without scanning the QR. Nothing to do with `tap-core`.

**Call this feature "Card check-in"** (`cardCheckinEnabled`, `canUseCardCheckin`) everywhere: entity
fields, plan gates, settings copy, i18n keys. Reusing "tap" would collide with a shipped feature in
the same settings screen.

## The credential

This is `tap-core`'s **kind `0x02`, issued pass**, unchanged. From `packages/tap-core/SPEC.md`:

```
0        version    = 0x01
1        kind       = 0x02
2..13    passId       12 bytes, ASCII
14..25   audienceId   12 bytes, ASCII
26..29   notBefore    uint32, unix seconds
30..33   notAfter     uint32, unix seconds
34..97   signature    64 bytes, raw r ‖ s
```

98 bytes fits a single NFC frame with no chaining, so a plain NTAG card carries it. `tap-core`
requires **no changes at all** — `PassIssuer`, `TapVerifier`, `RevocationStore` and the codec are
done and tested.

The ids line up with no adapter layer. `PassId::ALPHABET` is
`abcdefghjkmnpqrstuvwxyz23456789` at 12 bytes, byte-identical to what
`TokenGenerator::generatePublicId()` emits (`src/Util/TokenGenerator.php:157`).

| Protocol field | DailyBrew value | Why |
|---|---|---|
| `audienceId` | `Workspace.publicId` | A card minted for one restaurant is refused at another even under the same issuer key — `TapVerifier` compares it against the terminal's audience before anything else. |
| `passId` | `EmployeeCard.publicId` — the **card's** id, not the employee's | A lost card is revoked and a replacement issued to the same person; those must be distinguishable. It also keeps a stable employee identifier off a physical object that gets lost. |

The mapping `passId → EmployeeCard → Employee` is a database lookup on our side.
`TapResult::$subjectId` carries the pass id, and `TapResult::$credential` is `null` for issued
passes — they aren't tied to a device.

## Security model

**A card is a bearer credential. Anyone holding it can tap it.** That is the deliberate trade for
"works with no app", and the countermeasure is operational, not cryptographic — a kiosk fixed at a
supervised door, plus anti-passback.

This is consistent with how the product already treats enforcement: IP restriction, device
verification and geofencing are all Espresso toggles a workspace can run without, and
`attendanceTracking: none` opts an employee out of measurement entirely. The owner sets the dial.

Three things then carry the weight:

**Anti-passback.** `TapPolicy::$passReuseCooldownSeconds` defaults to `0` (off). For a shift kiosk it
must be non-zero, otherwise one person can tap four cards in eight seconds.
`TapVerifier::verifyIssuedPass()` consumes the pass id in a `('pass', terminalId)` scope for that
duration and throws `PassRecentlyUsed`. Suggested default: **60 seconds**, tunable per workspace
later. Note the scope is per terminal — the same card at a *different* door is not blocked, which is
right for a two-entrance restaurant and wrong for nothing we care about.

**Revocation.** The envelope carries no revocation field and cannot — a signed pass lives on a card
the issuer can't reach. The door has to be told. `RevocationStore` backed by
`EmployeeCard.revokedAt` is what makes "Sokha lost her card" a thirty-second action.
`TapVerifier` checks it *after* the signature (so a forger can't probe which pass ids exist) and
*before* the cooldown (so a withdrawn card doesn't burn the next holder's slot). It must not fail
open: an exception propagates and refuses the tap.

**Audit.** A tap should stamp the card id and the terminal id on the attendance row, so "two taps
from the same card ninety seconds apart at the same door" is visible in the log rather than an
unfalsifiable worry.

## Data model

### `EmployeeCard`

| Column | Notes |
|---|---|
| `id`, `publicId`, `createdAt`, `updatedAt` | House standard. `publicId` **is** the `passId`. |
| `employee` | ManyToOne, CASCADE with the employee. |
| `workspace` | Denormalised for the revocation lookup, which is scoped by audience. |
| `label` | "Blue card", "Card #4" — so an owner can tell two cards apart. |
| `notBefore`, `notAfter` | datetime, UTC. Mirrors what was signed; the signature is authoritative, this is for display and for re-issue decisions. |
| `issuedAt`, `issuedByEmail` | Audit snapshot, same shape as the attendance override audit. |
| `revokedAt`, `revokedByEmail`, `revokeReason` | Soft revocation, mirroring the attendance void audit. A revoked row is kept — it's the record of a card that existed. |

Validity window: cards are long-lived, so issue with a multi-year `notAfter` and rely on revocation
for early death. The uint32 ceiling (2106) is not a constraint in practice, but `PassIssuer` refuses
an out-of-range or inverted window rather than wrapping it, so the issuing code shouldn't try to be
clever.

### Issuer keys

One ECDSA P-256 keypair **per workspace**, not one platform-wide.
`IssuerKeyStore::publicKeysFor($audienceId)` is already scoped by audience, and a leaked
platform-wide private key would mint valid cards for every customer.

Store the private key encrypted at rest with `App\Service\Integration\SecretCipher` — the same
mechanism that protects `ApiToken.signingSecret` under `API_TOKEN_ENCRYPTION_KEY` with an HKDF of
`APP_SECRET` as fallback. Rotation: `publicKeysFor()` returns keys **newest first** and keeps the old
public key published until every card signed with it has expired or been revoked.

## The four store implementations

| Interface | DailyBrew implementation |
|---|---|
| `IssuerKeyStore` | Reads the workspace's issuer public keys by `audienceId` (= workspace publicId). |
| `RevocationStore` | `EmployeeCard.revokedAt IS NOT NULL` for `(passId, audienceId)`. Optional in the library, **mandatory here**. |
| `NonceStore` | Backs anti-passback. `CacheNonceStore` ships in the bundle, but read its docblock: PSR-6 has no compare-and-set. A unique database constraint is the right backing if a double-open ever matters. |
| `CredentialStore` | Only consulted for device assertions (kind `0x01`). A card-only deployment binds an implementation returning an empty iterable — it is not dead code, it's the seam that stays closed until phone-as-credential is wanted. |

## Endpoint

**Two independent credentials, one request.** The terminal proves it is the terminal; the card proves
who tapped. Neither substitutes for the other — without terminal authentication, anyone who copied a
card's 98 bytes could POST them from anywhere, which throws away the "kiosk in a supervised place"
control that the whole bearer model rests on.

Reuse the signed-request machinery already documented in
[docs/attendance-ingest.md](./attendance-ingest.md) for the terminal half: `X-DB-Key-Id`,
`X-DB-Timestamp`, `X-DB-Nonce`, `X-DB-Signature`, HMAC-SHA256 over the canonical string, ±300s skew,
per-key nonce replay cache, uniform 401 on every failure. The kiosk holds an `ApiToken` with a new
`checkin:tap` scope in `ApiTokenScopeEnum`.

```http
POST /api/v1/integrations/card-taps
X-DB-Key-Id: 7fk2mqx9r4tp
X-DB-Timestamp: 1786012800
X-DB-Nonce: 9f2c1a7b45de8103
X-DB-Signature: v1=6b1e…c4

{
  "assertion": "AQJtNHJ0MnfixIt…",   // base64url, AssertionCodec::toBase64Url()
  "terminalId": "front-door-01",
  "tappedAt": "2026-08-19T06:32:11Z", // the kiosk's own clock — see below
  "offlineBatch": false
}
```

The handler decodes the assertion, builds a `TapRequest`, and calls `TapService::verify()`, which
dispatches `TapVerifiedEvent` on success and `TapRejectedEvent` on refusal before rethrowing — so an
audit listener sees every tap without each call site remembering to log.

### The finding: kind `0x02` has no signed tap time

This is the one thing that materially shapes the implementation, and it isn't obvious from the
README.

For a **device assertion**, `tappedAt` is the device's own clock, inside the signature, and the
terminal nonce is consumed single-use — a captured exchange is worthless and a replayed queue admits
nobody twice.

For an **issued pass**, neither holds. `TapVerifier::verifyIssuedPass()` never consumes
`TapRequest::$nonce`, and it sets `TapResult::$tappedAt` to the *server's* `now()`. Only `notBefore`
and `notAfter` are signed. Two consequences:

1. **The real tap time must come from the kiosk, in the request body.** A kiosk that lost wifi for
   three hours and replays its queue would otherwise stamp every punch with the replay time. That
   value is unsigned by the protocol — which is exactly why the terminal must be authenticated, and
   why `tappedAt` above sits in the HMAC-covered body rather than being derived server-side.
2. **Replay idempotency is ours to provide.** The pass cooldown is time-bounded, so submitting the
   same offline queue twice an hour later passes verification twice. Left unguarded that is worse
   than a duplicate row: `CheckinService` treats a second tap as a *check-out*, so a re-submitted
   queue would close everyone's shift. Guard it with a `CardTap` table carrying a unique constraint
   on `(passId, terminalId, tappedAt)`, written before the check-in is applied.

Set `bangkeut_tap.policy.batch_max_age_seconds` to bound how stale a queued tap may be (default
86400 — a door that lost wifi for a day must still hand over what it recorded).

## Applying the tap

A listener on `TapVerifiedEvent` resolves the card to an employee and calls `CheckinService`. A
listener that throws fails the tap, which is correct for "verified but not allowed here" (revoked
employee, closure, approved leave) and wrong for anything cosmetic.

Add `CheckinService::SOURCE_CARD = 'card'` alongside the existing `SOURCE_NFC`, and reuse the NFC
double-tap cooldown as the precedent for how a repeated tap is absorbed rather than flipped into a
check-out.

### Check-in settings need per-mode treatment

`EffectiveCheckinSettings` gates the existing pipeline, and a shared kiosk breaks one of its
assumptions:

- **Device verification must be bypassed for card taps.** The rule is "within a day, one device per
  employee, and the check-out must come from the same device as the check-in". A kiosk is one device
  shared by everyone — the first tap of the morning would bind it to that employee and reject the
  rest of the crew. This is the single most likely thing to be discovered late; decide it up front.
- **IP restriction works well and should stay on.** The kiosk sits on the restaurant's network,
  which is exactly the control the feature was built for.
- **Geofencing needs a fixed location.** A kiosk has no GPS to offer. Either configure the terminal's
  coordinates server-side or skip the check for card taps — silently passing `null` coordinates into
  a geofence check is the wrong answer.
- **Closure and leave checks apply unchanged**, against the resolved attendance day.

Overnight shifts need no special handling: `CheckinService::resolveAttendanceDay()` already routes a
post-midnight punch to yesterday's open row, and it is source-agnostic.

## Configuration and gating

```yaml
# config/packages/bangkeut_tap.yaml
bangkeut_tap:
    policy:
        max_age_seconds: 120
        max_future_skew_seconds: 30
        nonce_ttl_seconds: 900              # must exceed max_age_seconds or the build fails
        pass_reuse_cooldown_seconds: 60     # anti-passback — 0 is wrong for a shift kiosk
        batch_max_age_seconds: 86400
```

Gate it twice, the way `nfc_checkin` already is: a `FeatureFlagEnum` case for stage rollout
(`dev → alpha → beta → release`, so it can ship dark and go to testing-track workspaces first) and a
`PlanService::canUseCardCheckin()` plan gate. Espresso is the natural tier — it sits with device
verification, IP restriction and geofencing, and it is the tier whose customers have a door worth
putting a kiosk at.

## The kiosk

The largest unknown, and the only piece with no code anywhere in either repository today. It must:

- run an NFC reader loop (Android in reader mode is the obvious host — the mobile app is Expo, so
  this is likely a separate build target rather than a screen in the existing app);
- generate a per-tap nonce (unused by the pass path today, but required by `TapRequest` and needed
  the moment phone-as-credential is added);
- hold an `ApiToken` + signing secret, and sign every request;
- record its own `tappedAt` per tap;
- queue taps while offline and replay them with `offlineBatch: true`;
- show the outcome to the person standing in front of it — name, time, and a clear refusal reason,
  in the workspace language.

Whether that is a dedicated Android app, a repurposed phone, or an off-the-shelf terminal is the
first thing to decide, because it determines the cost per location and therefore who the feature is
sellable to.

## Implementation status

**Built** (Espresso-gated, `WorkspaceSetting.cardCheckinEnabled` off by default):

| Piece | Where |
|---|---|
| `EmployeeCard`, `WorkspaceIssuerKey`, `CardTap`, `TapNonce` | `src/Entity/`, migration `Version20260819120000` |
| Issue / revoke / key rotation | `App\Service\Card\CardIssuanceService` |
| Tap → attendance | `App\Service\Card\CardTapService` |
| The four store implementations | `src/Tap/`, bound in `config/packages/tap_stores.yaml` |
| Verification policy | `config/packages/bangkeut_tap.yaml` — anti-passback at 60s |
| Kiosk ingest | `POST /api/v1/integrations/card-taps`, signed, scope `checkin:tap` |
| Card management | `/workspaces/{ws}/employee-cards` — GET, POST, DELETE, gated on `manage_employees` |
| Plan gate | `PlanService::canUseCardCheckin()` — Espresso and above |
| Console UI | Settings → Card check-in — toggle, issue form, card list, revoke. Both frontends. |

**Not built:**

- **The kiosk.** No code in any repository. Designed in
  [docs/kiosk.md](./kiosk.md) — the tap loop, the two-clocks problem,
  provisioning, and hardware options costed rather than chosen. The hardware
  choice decides the cost per location and therefore who the feature is sellable
  to, and everything else waits on it.
- **Mobile.** Card management ships in the app (daily-brew-mobile#56).

## Deliberately out of scope

- **Phone as credential** (kind `0x01`). The `CredentialStore` seam stays in place, empty, so this
  needs no redesign later — but it solves the opposite problem (staff who *do* have phones, who are
  already served by QR).
- **Secure-element cards** (NTAG 424 DNA, DESFire) that do AES-CMAC challenge-response and would
  remove the bearer weakness without an app. That needs a third credential kind (`0x03`) in the
  spec, since both current kinds are ECDSA. The version and kind bytes at the head of every envelope
  were designed so this is additive rather than a v2 — but it is a `tap-core` change, and this
  design deliberately requires none.
- **Self-service card enrolment.** Cards are issued by an owner or manager from the console.

## Open questions

1. **Card production.** Who prints and encodes them — us, the customer with a phone-based writer
   (the `nfc_writer` flag already covers Android tag writing), or a supplier?
2. **Kiosk hardware**, per above.
3. **Card issuance permission.** A new `ManagerPermissionEnum` case, or owner-only? Issuing a card is
   closer to `manage_employees` than to `manage_attendance`.
4. **Anti-passback default.** 60 seconds is a guess. It should be validated against a real service
   change-over, where a queue of staff tapping in sequence is normal and must not trip anything.
