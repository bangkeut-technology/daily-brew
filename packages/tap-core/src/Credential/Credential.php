<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Credential;

/**
 * One public key on file for one holder. A holder may have several — a phone and a spare — and the
 * verifier tries each until one signature matches.
 *
 * Host applications implement this on whatever entity they already have (DailyBrew maps it onto an
 * employee's enrolled device); the library never owns a table.
 */
interface Credential
{
    /** Stable identifier for this credential, for audit trails. */
    public function credentialId(): string;

    public function holderId(): string;

    /** PEM-encoded SubjectPublicKeyInfo for a P-256 key. */
    public function publicKeyPem(): string;
}
