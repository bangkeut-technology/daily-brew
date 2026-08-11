<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Signature;

interface SignatureVerifier
{
    /**
     * @param string $message      the exact bytes that were signed
     * @param string $rawSignature 64-byte r ‖ s
     * @param string $publicKeyPem PEM SubjectPublicKeyInfo, P-256
     */
    public function verify(string $message, string $rawSignature, string $publicKeyPem): bool;
}
