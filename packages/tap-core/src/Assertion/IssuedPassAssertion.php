<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Assertion;

/**
 * Kind 0x02 — the issuer signed this pass at issuance; the door verifies it offline. See SPEC.md.
 */
final readonly class IssuedPassAssertion implements Assertion
{
    public function __construct(
        public string $passId,
        /** The event / tenant this pass is valid for. Checked against the terminal's audience. */
        public string $audienceId,
        public int $notBefore,
        public int $notAfter,
        public string $signature,
    ) {
    }

    public function kind(): AssertionKind
    {
        return AssertionKind::IssuedPass;
    }

    public function subjectId(): string
    {
        return $this->passId;
    }

    public function signature(): string
    {
        return $this->signature;
    }
}
