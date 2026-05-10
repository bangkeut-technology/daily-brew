<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\EncodingModeEnum;
use PHPUnit\Framework\TestCase;

class EncodingModeEnumTest extends TestCase
{
    public function testValues(): void
    {
        $this->assertSame('base32', EncodingModeEnum::BASE32->value);
        $this->assertSame('base36', EncodingModeEnum::BASE36->value);
        $this->assertSame('base64', EncodingModeEnum::BASE64->value);
        $this->assertSame('base64url', EncodingModeEnum::BASE64URL->value);
    }

    public function testEnumCoversFourEncodings(): void
    {
        $this->assertCount(4, EncodingModeEnum::cases());
    }

    public function testTryFromKnownAndUnknownValues(): void
    {
        $this->assertSame(EncodingModeEnum::BASE64URL, EncodingModeEnum::tryFrom('base64url'));
        $this->assertNull(EncodingModeEnum::tryFrom('base16'));
    }
}
