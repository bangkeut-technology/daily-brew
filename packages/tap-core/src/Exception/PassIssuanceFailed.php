<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Exception;

/**
 * A pass was asked for that could never be admitted — an id of the wrong length, a validity window
 * that ends before it starts, a timestamp outside the wire format's uint32 range.
 *
 * Caught at issuance on purpose. The alternative is minting the pass anyway and discovering the
 * mistake at the door, in front of the holder, with the issuer offline.
 */
final class PassIssuanceFailed extends \RuntimeException
{
}
