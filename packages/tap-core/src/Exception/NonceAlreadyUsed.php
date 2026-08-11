<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Exception;

/** This nonce was already consumed at this terminal — a replayed tap. */
final class NonceAlreadyUsed extends TapException
{
}
