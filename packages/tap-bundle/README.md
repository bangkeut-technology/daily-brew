# bangkeut/tap-bundle

Symfony integration for [`bangkeut/tap-core`](../tap-core/README.md).

Thin on purpose: no entities, no routes, no controllers. Your application owns its tables, its
firewall and its endpoint shapes — the bundle wires up the verifier and announces outcomes.

## Enable it

```php
// config/bundles.php
Bangkeut\TapBundle\BangkeutTapBundle::class => ['all' => true],
```

```yaml
# config/packages/bangkeut_tap.yaml
bangkeut_tap:
    policy:
        max_age_seconds: 120              # how stale a device assertion may be
        max_future_skew_seconds: 30       # tolerance for a fast device clock
        nonce_ttl_seconds: 900            # must exceed max_age_seconds
        pass_reuse_cooldown_seconds: 0    # anti-passback; 0 allows re-entry
        batch_max_age_seconds: 86400      # freshness window when replaying an offline queue
```

`nonce_ttl_seconds` shorter than `max_age_seconds` fails the container build — that combination
makes captured assertions replayable once the nonce record expires, which is too quiet a hole to
allow through.

## Implement three interfaces

Autowiring binds them; there is nothing else to configure.

```php
class EmployeeDeviceKeyStore implements Bangkeut\Tap\Credential\CredentialStore { … }
class EventIssuerKeyStore    implements Bangkeut\Tap\Credential\IssuerKeyStore { … }
class DoctrineNonceStore     implements Bangkeut\Tap\Nonce\NonceStore { … }
```

A `CacheNonceStore` ships here for convenience. **Read its docblock before using it on a paid
gate** — PSR-6 has no compare-and-set, so a unique database constraint is the right backing where a
double-open costs money.

## Verify a tap

```php
public function tap(Request $request, TapService $taps): JsonResponse
{
    $result = $taps->verify(new TapRequest(...)); // throws TapException when refused

    return $this->json(['holder' => $result->subjectId]);
}
```

`TapService` dispatches `TapVerifiedEvent` on success and `TapRejectedEvent` on refusal before
rethrowing, so an audit listener sees every tap without each call site remembering to log.

The verified event is the product seam: DailyBrew listens and records attendance; an event gate
listens and admits an attendee. A listener that throws fails the tap — correct for "verified but not
allowed here", wrong for anything cosmetic.
