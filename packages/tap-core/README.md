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

Four interfaces, implemented against whatever storage you already have:

- **`CredentialStore`** — active public keys for a holder. Returning a revoked key is a hole; filter
  in the query, not afterwards.
- **`IssuerKeyStore`** — public keys trusted to mint passes for an audience. Returns several so a
  signing key can rotate without invalidating passes already in wallets.
- **`NonceStore`** — atomic claim-once. Backing it with a unique database constraint is the safest
  implementation; see the caveat on the bundle's cache-backed one.
- **`RevocationStore`** — whether a pass has been withdrawn. Optional, and defaults to
  `NullRevocationStore`; see [Taking a pass back](#taking-a-pass-back) for when that default is
  wrong.

## Issuing a pass

The other half. A device assertion needs no issuer — the holder's phone signs each tap from its own
keystore — but an issued pass is minted once, by you, and `PassIssuer` is the reference
implementation of that.

```php
$keys = Es256KeyPair::generate();          // once per event; publish $keys->publicKeyPem to the doors
$issuer = new PassIssuer($keys->privateKeyPem);

$pass = $issuer->issue(
    passId:     PassId::generate(),        // 12 chars, no i/l/o/0/1
    audienceId: 'amcham0926ex',
    notBefore:  new DateTimeImmutable('2026-09-26 07:00'),
    notAfter:   new DateTimeImmutable('2026-09-26 19:00'),
);

$pass->bytes;      // 98 bytes for NFC
$pass->base64Url;  // the string you put in a QR code, a wallet payload or a JSON body
```

`Es256KeyPair::fromPrivateKeyPem()` derives the public half when the private key comes from a secret
store, which is what you publish to terminals. Rotating a signing key means minting with the new one
while `IssuerKeyStore` keeps returning the old public key until the passes already in wallets have
expired.

Everything that would produce an unusable pass is refused at issuance, as `PassIssuanceFailed` — an
id that isn't 12 printable ASCII bytes, a window that ends before it starts, a timestamp past what
the format's uint32 can carry. That last one matters more than it looks: `pack('N', …)` truncates
silently, so the alternative to refusing is a pass whose signed window is 136 years out and whose
holder finds out at a door, months later, with the issuer offline.

## Taking a pass back

A device key is revoked by dropping it from your `CredentialStore` — the credential stops matching
and there is nothing else to do. A pass is harder: it carries its own authority in a signature you
can't reach, sitting in a wallet you don't control. The only way to take one back is to tell the
door.

```php
$verifier = new TapVerifier(
    // …
    revocations: $yourRevocationStore,   // implements Revocation\RevocationStore
);
```

The check runs after the signature — an unauthenticated forger must not be able to use a door as an
oracle for which pass ids exist — and before the anti-passback cooldown, so a withdrawn pass doesn't
consume the slot belonging to whoever taps next. A refused tap is a `PassRevoked`, deliberately
distinct from `InvalidSignature`: this holder isn't an attacker, they're someone whose ticket was
refunded, and the door staff need to be told the difference.

**Fail closed.** If your store throws, the exception propagates and the tap is refused. A door that
can't tell whether a ticket is still good must not wave people through — the answer to a database
outage is to sync a list and run offline, which is what `InMemoryRevocationStore` is for:

```php
$revocations = new InMemoryRevocationStore('amcham0926ex', $idsSyncedWhileOnline);
```

Sync by **replacing** the list, not merging into it — a refund that gets reversed, or a lost badge
that turns up, has to become admissible again. The list stays small on its own: a revocation only
matters while the pass it names is still inside its validity window, so it is bounded by the event
rather than by history.

`NullRevocationStore` is the default, and it is the right choice for a device-only deployment. If
you issue passes that can be refunded, cancelled or lost, it is not.

## Offline

Every verification needs public keys only, so a terminal can hold its roster, verify at the door
with no network, queue taps, and replay them later with `TapRequest::$offlineBatch = true`. That
widens the freshness window and changes nothing else. Nonce consumption makes a replayed queue
idempotent: submitting the same batch twice admits nobody twice.

Revocation is the one thing a door can be wrong about while offline — it enforces the list it last
synced, so a pass withdrawn during the outage is admitted until the next sync. That is a property of
being offline, not a bug to fix: the alternative is refusing everyone the moment the network drops.

## What it deliberately does not do

No entities, no HTTP, no enrolment flow, no rate limiting, no decision about *whether this holder is
allowed here* — that last one is authorisation, and it belongs to the product, not the protocol.

Issuance stops at the bytes: who may be issued a pass, what a pass costs, where the private key
lives, and how the pass reaches a phone (wallet, email, print-at-home) are all the host's. There is
no device-side signer here either — a holder's key belongs in Android Keystore or a Secure Enclave,
and a private key that PHP can read is not one of those.

## Protocol

See [SPEC.md](SPEC.md). The version byte is the compatibility promise; unknown versions are rejected
rather than guessed. `AssertionCodecTest` pins the byte layout so device and issuer SDKs written in
other languages have something authoritative to check themselves against.
