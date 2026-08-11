# bangkeut/tap-core

A **holder** presents a credential to a **terminal**; this library says whether it is genuine. What
the tap *means* is the host application's business.

Framework-free, storage-free, transport-free. The only hard dependencies are `ext-openssl` and
`psr/clock`.

## Two credential kinds

| | Device assertion | Issued pass |
|---|---|---|
| Who signs | the holder's device, per tap | you, once, at issuance |
| Needs an app | yes (Android HCE, or any keystore) | no — a barcode in Apple/Google Wallet is enough |
| Forgeable | no | no |
| Replayable | no — signs the terminal's nonce | yes, it's a bearer token — hence anti-passback |
| Fits | staff at a kiosk | attendees at a conference door |

A conference attendee will not install an app for a one-day forum, and a staff member taps the same
kiosk twice a day for years. Both flows verify through the same `TapVerifier`.

## Using it

```php
$verifier = new TapVerifier(
    credentials: $yourCredentialStore,   // implements Credential\CredentialStore
    issuerKeys:  $yourIssuerKeyStore,    // implements Credential\IssuerKeyStore
    nonces:      $yourNonceStore,        // implements Nonce\NonceStore
    signatures:  new OpenSslEs256Verifier(),
    clock:       $psrClock,
    policy:      new TapPolicy(passReuseCooldownSeconds: 60),
);

try {
    $result = $verifier->verify(new TapRequest(
        assertion:  $bytesFromTheReader,
        nonce:      $nonceThisTerminalJustGenerated,
        terminalId: 'gate-hall-a',
        audienceId: 'amcham0926ex',
    ));
    // $result->subjectId is who tapped. Do your thing.
} catch (TapException $refused) {
    // The subclass says why: PassExpired, InvalidSignature, NonceAlreadyUsed, …
}
```

Three interfaces, implemented against whatever storage you already have:

- **`CredentialStore`** — active public keys for a holder. Returning a revoked key is a hole; filter
  in the query, not afterwards.
- **`IssuerKeyStore`** — public keys trusted to mint passes for an audience. Returns several so a
  signing key can rotate without invalidating passes already in wallets.
- **`NonceStore`** — atomic claim-once. Backing it with a unique database constraint is the safest
  implementation; see the caveat on the bundle's cache-backed one.

## Offline

Every verification needs public keys only, so a terminal can hold its roster, verify at the door
with no network, queue taps, and replay them later with `TapRequest::$offlineBatch = true`. That
widens the freshness window and changes nothing else. Nonce consumption makes a replayed queue
idempotent: submitting the same batch twice admits nobody twice.

## What it deliberately does not do

No entities, no HTTP, no enrolment flow, no rate limiting, no decision about *whether this holder is
allowed here* — that last one is authorisation, and it belongs to the product, not the protocol.

## Protocol

See [SPEC.md](SPEC.md). The version byte is the compatibility promise; unknown versions are rejected
rather than guessed. `AssertionCodecTest` pins the byte layout so device and issuer SDKs written in
other languages have something authoritative to check themselves against.
