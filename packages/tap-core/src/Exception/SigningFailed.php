<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Exception;

/**
 * A key could not be generated, loaded, or used to sign.
 *
 * Deliberately *not* a {@see TapException}: that family means "a tap was refused", which is a
 * normal operational outcome. This one means the issuer is misconfigured — a missing key file, a
 * key for the wrong curve — and nobody's credential is at fault.
 */
final class SigningFailed extends \RuntimeException
{
}
