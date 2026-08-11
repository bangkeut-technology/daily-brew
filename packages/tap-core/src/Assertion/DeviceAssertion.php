<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Assertion;

/**
 * Kind 0x01 — the holder's device signed the terminal's nonce. See SPEC.md.
 */
final readonly class DeviceAssertion implements Assertion
{
    public function __construct(
        public string $holderId,
        /** The device's own clock at tap time, covered by the signature. */
        public int $tappedAt,
        public string $signature,
    ) {
    }

    public function kind(): AssertionKind
    {
        return AssertionKind::DeviceAssertion;
    }

    public function subjectId(): string
    {
        return $this->holderId;
    }

    public function signature(): string
    {
        return $this->signature;
    }
}
