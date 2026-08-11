<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Exception;

/** The assertion's own timestamp falls outside the freshness window. */
final class AssertionExpired extends TapException
{
}
