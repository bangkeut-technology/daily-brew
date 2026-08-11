<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Assertion;

enum AssertionKind: int
{
    /** The holder's device signs a nonce the terminal just generated. Unforgeable, unreplayable. */
    case DeviceAssertion = 0x01;

    /** The issuer signed the pass once, at issuance. A bearer token — see SPEC.md on the trade. */
    case IssuedPass = 0x02;
}
