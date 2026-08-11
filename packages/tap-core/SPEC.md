# Tap protocol — v1

A **holder** presents a credential to a **terminal**; the terminal (or the server behind it)
verifies it and decides what the tap means. What a tap *means* — a shift check-in, admission to a
conference hall — is none of this protocol's business.

Two credential kinds share one envelope:

| Kind | Byte | Who signs | Needs an app | Replay defence |
|------|------|-----------|--------------|----------------|
| Device assertion | `0x01` | the holder's device | yes | terminal nonce, single-use |
| Issued pass | `0x02` | the issuer, once, at issuance | no | anti-passback cooldown |

A device assertion is unforgeable and unreplayable: the holder signs a nonce the terminal just
generated, so a captured exchange is worthless. An issued pass is a bearer token — anyone holding a
copy can present it. That is a deliberate trade for "works on any phone with no install", and the
countermeasure is operational (anti-passback, a terminal in a controlled place), not cryptographic.

## Envelope

All multi-byte integers are big-endian. Signatures are ECDSA P-256 over SHA-256, encoded as the raw
64-byte `r ‖ s` (not DER — DER's variable length is a poor fit for an NFC APDU budget).

Every assertion starts with:

```
byte 0 : version (0x01)
byte 1 : kind    (0x01 device assertion | 0x02 issued pass)
```

An unknown version or kind is rejected — never "best effort" parsed.

### Kind 0x01 — device assertion (82 bytes)

```
0        version   = 0x01
1        kind      = 0x01
2..13    holderId    12 bytes, ASCII (public id alphabet)
14..17   tappedAt    uint32, unix seconds
18..81   signature   64 bytes, raw r ‖ s
```

Signed bytes (built by the device, re-built by the verifier — never transmitted):

```
"BKTAP1" ‖ 0x01 ‖ nonceLen(uint8) ‖ nonce ‖ terminalIdLen(uint8) ‖ terminalId ‖ holderId ‖ tappedAt
```

The nonce comes from the terminal and MUST be freshly random per tap (16 bytes recommended). The
verifier consumes it single-use, scoped to the terminal, so the same nonce presented twice fails
even if the signature is valid.

`tappedAt` is the device's clock and is checked against `TapPolicy::$maxAgeSeconds` /
`$maxFutureSkewSeconds`. It is inside the signature, so it cannot be edited in transit.

### Kind 0x02 — issued pass (98 bytes)

```
0        version    = 0x01
1        kind       = 0x02
2..13    passId       12 bytes, ASCII
14..25   audienceId   12 bytes, ASCII — the event/tenant this pass is valid for
26..29   notBefore    uint32, unix seconds
30..33   notAfter     uint32, unix seconds
34..97   signature    64 bytes, raw r ‖ s
```

Signed bytes:

```
"BKTAP1" ‖ 0x02 ‖ passId ‖ audienceId ‖ notBefore ‖ notAfter
```

The signature deliberately does **not** cover the terminal nonce: the issuer signs once, at ticket
purchase, and a door with no internet must still verify it. The terminal supplies a nonce anyway so
the same bookkeeping path can enforce anti-passback.

`audienceId` must equal the terminal's audience, so a pass minted for one event cannot be presented
at another even if both trust the same issuer key.

`notBefore` and `notAfter` are unsigned 32-bit, so the representable window is 1970-01-01 to
2106-02-07, and `notAfter` must be strictly greater than `notBefore`. Both bounds are inside the
signature: an issuer that truncates a timestamp into range signs the truncated value, and the door
enforces what was signed. Issuers must therefore refuse an out-of-range window rather than wrap it —
`PassIssuer` is the reference implementation of that rule.

Ids (`passId`, `audienceId`) are exactly 12 bytes with no length prefix, so their width is part of
the format, not a convention. A verifier accepts any 12 bytes; an issuer should emit printable ASCII
only, since these values end up in barcodes, URLs and log lines.

## Revocation

The envelope carries no revocation field, and cannot: an issued pass is signed once and then lives
in a wallet the issuer can't reach. A pass that could say "I have been withdrawn" would be a pass
whose holder could say otherwise.

Revocation is therefore **out of band** — the terminal is told, not the credential. A verifier
consults a revocation list scoped to the audience, after the signature verifies and before any
anti-passback bookkeeping. Device assertions have no equivalent because they don't need one:
dropping a key from the credential store revokes it.

Two consequences a door has to live with:

- **Offline enforcement is as fresh as the last sync.** A pass withdrawn during an outage is
  admitted until the terminal syncs again. Refusing everyone the moment the network drops is worse.
- **A list is a snapshot, not a log.** Sync by replacement, so that un-revoking (a reversed refund,
  a badge found) can be expressed at all.

The list is bounded by the event rather than by history: a revocation stops mattering once the pass
it names falls outside its own validity window.

## Transport

The bytes are transport-agnostic. Over NFC (Android HCE) they travel as an APDU response — 98 bytes
fits a single frame, no chaining. Over a scanned barcode or an HTTP body they are base64url with no
padding (`AssertionCodec::toBase64Url()`).

## Offline

Both kinds verify with public keys only, so a terminal can hold the roster and verify at the door
with no network, queue the taps, and replay them later. On replay the server re-verifies from
scratch and applies `TapPolicy::$batchMaxAgeSeconds` instead of the live freshness window. Nonce
consumption is what makes a replayed batch idempotent — submitting the same queue twice admits
nobody twice.

## Versioning

The version byte is the only compatibility promise. A v2 may change every field after byte 0; a
verifier that does not know a version rejects it rather than guessing. Terminals and issuers are
expected to be able to run two versions during a migration.
