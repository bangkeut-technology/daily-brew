# The kiosk (design)

**Status: being built** in
[bangkeut-technology/dailybrew-kiosk](https://github.com/bangkeut-technology/dailybrew-kiosk)
— the protocol core, the queue, the screens and the NFC read all exist, and
nothing has run on hardware yet. The server side it talks to is complete; see
[docs/card-checkin.md](./card-checkin.md).

The kiosk is the box on the wall. An employee holds a card to it, it says
"Sokha — checked in, 06:32", and attendance is recorded. That is the entire
product surface, and almost all of the difficulty is in what happens when the
network isn't there.

## What the server already gives it

Nothing below needs building first. A kiosk written today would work against
production.

```http
POST /api/v1/integrations/card-taps
X-DB-Key-Id: 7fk2mqx9r4tp
X-DB-Timestamp: 1786012800
X-DB-Nonce: 9f2c1a7b45de8103
X-DB-Signature: v1=6b1e…c4
Content-Type: application/json

{
  "assertion": "AQJtNHJ0MnfixIt…",
  "terminalId": "front-door-01",
  "tappedAt": "2026-08-19T06:32:11Z",
  "offlineBatch": false
}
```

The signing scheme is the one documented in
[docs/attendance-ingest.md](./attendance-ingest.md), unchanged: HMAC-SHA256 over
`v1\n{ts}\n{nonce}\n{METHOD}\n{path}\n{sha256(body)}`, ±300s skew, per-key nonce
replay cache.

**Success** returns the attendance record plus `duplicate: true|false`.
**Refusal** returns 403 with a machine-readable `reason` — `pass_revoked`,
`pass_expired`, `pass_not_yet_valid`, `audience_mismatch`, `invalid_signature`,
`malformed_assertion`, `pass_recently_used`, `unknown_issuer` — and a message.
The reason is deliberately specific, unlike an API-key failure: a card is held
by someone entitled to know why it didn't work.

## The two clocks problem

This is the part a kiosk implementation gets wrong if nobody says it out loud.

An issued pass carries **no signed tap timestamp**, and the verifier stamps its
own `now()` when it runs. So:

- **The kiosk's clock is authoritative for `tappedAt`**, and the server trusts
  it because the *terminal* is authenticated. A queue replayed three hours later
  must carry the original instants or every punch in it lands at replay time.
- **The kiosk's clock is not authoritative for the signature.** `X-DB-Timestamp`
  is checked against ±300s of server time, so a terminal whose clock has drifted
  more than five minutes cannot talk to the API at all — while still being able
  to record taps offline.

That asymmetry has a consequence worth designing for: **a kiosk that has been
offline for a long time may come back with a bad clock and a full queue.** It
must be able to correct its own clock (NTP, or the `Date` header on any
response) *before* draining the queue, and the queued `tappedAt` values must not
be rewritten when it does — they were right when they were recorded.

## Duplicate submission is already safe

`CardTap` holds a unique key on `(passId, terminalId, tappedAt)`. Re-sending a
queue is a no-op that returns `duplicate: true` rather than punching again.

This matters more than it sounds: a second tap reads as a **check-out**, so
without that guard a re-submitted queue would close the whole crew's shift. The
kiosk therefore does *not* need to be careful about at-most-once delivery — it
should retry freely and let the server decide. **Retry until acknowledged** is
the correct client design here.

## The tap loop

```
idle ──card detected──► read 98 bytes ──► queue locally (durable)
                                              │
                                              ├── online ──► POST ──► show result
                                              │                 │
                                              │                 └─ refused ──► show reason
                                              └── offline ─► show "recorded, will sync"
```

Two decisions inside that:

**Record before showing anything.** The durable write happens before the network
call, so a kiosk that loses power between reading a card and getting a response
still has the tap. The person has already walked away.

**Show a result without waiting for the server where possible.** A round trip on
a bad connection can take seconds, and someone standing at a door will tap
again. The kiosk knows the card is well-formed before it sends; what it cannot
know offline is whether the card is revoked, or whether this is a check-in or a
check-out. Showing "recorded" and reconciling later is honest; showing "checked
in" when it might be a check-out is not.

## What the person in front of it sees

The screen is the product. It should say, in the workspace's language:

| State | Shows |
|---|---|
| Idle | The time, and "Hold your card here" |
| Accepted | **Name**, whether this was in or out, and the time. Names are shown: it is the feedback that makes a tap feel like it worked, at the cost of being readable by anyone at the door — accepted for a device in a staff area. |
| Accepted offline | Name is unavailable — say "Recorded" and the time, not a guess |
| Refused | Why, in a sentence a person can act on ("This card was withdrawn — see your manager") |
| Not a DailyBrew card | "Card not recognised" — never a stack trace or a hex dump |

The refusal reasons map to sentences, not codes. `pass_recently_used` is "Already
recorded a moment ago", which is reassurance rather than an error.

## Provisioning

A terminal needs three things: an API token, its signing secret, and a
`terminalId`.

The first two come from **Settings → API keys**, minted with the **card
check-in** scope (`checkin:tap`). Both secrets are shown exactly once, at mint.

`terminalId` is chosen by the operator and is free text up to 64 characters —
`front-door-01`, `kitchen`. It matters because anti-passback is scoped per
terminal: the same card at a *different* door is not blocked, which is right for
a two-entrance restaurant. Two kiosks sharing a `terminalId` share a cooldown.

**Decided: a QR rendered by the console**, read by the kiosk's camera on first
run. Typing a 48-character key and a 68-character secret onto a wall-mounted
tablet is miserable enough that operators would find a worse way.

It is built. Minting a key with the card check-in scope shows a **Pair a kiosk**
panel in the same modal that already displays both secrets — the only place they
are ever visible — with a field for the door name.

The QR encodes, following the existing `dailybrew:` scheme so a scanner can route
on the prefix without parsing the body:

```
dailybrew:kiosk:{base64url(JSON)}
```

```json
{
  "v": 1,
  "api": "https://dailybrew.work/api/v1",
  "ws": "wsp3kq7m2xzn",
  "key": "db_…",
  "secret": "dbs_…",
  "terminal": "front-door-01"
}
```

The API base travels with the credentials so one build of the kiosk works
against production and the staging mirror without a rebuild.

**The credentials are in the clear inside that QR — the code *is* the key.** That
is the accepted trade for not typing them, and it is why the panel renders only
in the mint modal and says so. A short-lived pairing code (kiosk shows six
digits, operator types them into the console, server hands over the credentials)
is the better answer if kiosks are ever sold at volume; it needs a new endpoint
pair and a pairing-code table, and is deliberately deferred.

## Hardware

**Decided: a dedicated Android app on a cheap tablet with an NFC reader.** Full
control of the screen, the queue and kiosk mode, at the cost of a second app to
build and ship. The alternatives, for the record:

| Option | Rough cost/location | Trade |
|---|---|---|
| **Repurposed phone running the existing app in a kiosk mode** | whatever's in the drawer | Cheapest to start and reuses the Expo app, its i18n and its API layer. Awkward as a permanent fixture: battery, screen timeout, and a phone in kiosk mode is still a phone. |
| **Off-the-shelf NFC terminal** | higher, plus per-unit lead time | Purpose-built, mounts properly, survives a kitchen. Least control over the software, and the vendor's SDK becomes a dependency. |

A fourth exists and should not be dismissed: **the kiosk is a web page**. Android
Chrome supports Web NFC (`NDEFReader`), so a tablet in a browser could read tags
with no app at all — but Web NFC reads NDEF records, not the raw APDU exchange,
and iOS does not support it. It would work for a tag-as-data card and not for
anything richer.

## What the kiosk must handle that nothing else does

- **A card the workspace doesn't know.** Refuse politely; do not leak whether the
  pass id exists.
- **A dead network at open.** The first tap of the day may be offline. The queue
  is the feature, not a fallback.
- **Storage limits.** A day of a busy restaurant is a few hundred taps — trivial
  — but the queue must survive an app restart, which rules out memory.
- **Someone tapping twice.** Anti-passback returns `pass_recently_used`; the
  screen should treat that as "already got it", not as a failure.
- **Being wrong about the date.** Overnight shifts mean a tap at 02:00 belongs to
  yesterday's row. The kiosk does not decide this — the server does — so the
  screen should avoid claiming a date it hasn't been told.

## Open questions

1. **Anti-passback tuning.** `pass_reuse_cooldown_seconds` is 60 and is a guess.
   It wants validating against a real service change-over, where a crew tapping
   in sequence is normal and must not trip anything.
2. **Multiple kiosks per workspace** work today (per-terminal anti-passback), but
   nothing in the console lists which terminals exist or when each was last seen.
   A terminal registry would make a fleet supportable.
