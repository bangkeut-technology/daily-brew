<?php

declare(strict_types=1);

namespace Bangkeut\Tap;

/**
 * Protocol constants. See SPEC.md — this file and that document must move together.
 */
final class Tap
{
    /** Domain separator, prefixed to every signed byte string. */
    public const string MAGIC = 'BKTAP1';

    public const int VERSION_1 = 0x01;

    /** Length of a holder / pass / audience identifier, in bytes. */
    public const int ID_LENGTH = 12;

    /** Raw ECDSA P-256 signature: r ‖ s, 32 bytes each. */
    public const int SIGNATURE_LENGTH = 64;

    public const int DEVICE_ASSERTION_LENGTH = 82;

    public const int ISSUED_PASS_LENGTH = 98;

    private function __construct()
    {
    }
}
