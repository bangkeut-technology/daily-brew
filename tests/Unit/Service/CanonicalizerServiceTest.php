<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Service\CanonicalizerService;
use PHPUnit\Framework\TestCase;

class CanonicalizerServiceTest extends TestCase
{
    private CanonicalizerService $svc;

    protected function setUp(): void
    {
        $this->svc = new CanonicalizerService();
    }

    public function testCanonicalizeNameLowercasesAndSlugs(): void
    {
        $this->assertSame('the-daily-grind', $this->svc->canonicalizeName('The Daily Grind'));
        $this->assertSame('cafe-noir', $this->svc->canonicalizeName('Café Noir'));
    }

    public function testCanonicalizeNameStripsLeadingAndTrailingPunctuation(): void
    {
        $this->assertSame('hello-world', $this->svc->canonicalizeName('  Hello, World!  '));
    }

    public function testCanonicalizeNameTransliteratesAccentedCharacters(): void
    {
        $this->assertSame('cafe-creme', $this->svc->canonicalizeName('Café Crème'));
    }

    public function testCanonicalizeEmailLowercasesEntireString(): void
    {
        $this->assertSame('owner@dailybrew.work', $this->svc->canonicalizeEmail('Owner@DailyBrew.Work'));
    }

    public function testCanonicalizeEmailLeavesAlreadyLowercaseEmailUnchanged(): void
    {
        $this->assertSame('foo@bar.com', $this->svc->canonicalizeEmail('foo@bar.com'));
    }

    public function testCanonicalizeEmailHandlesUnicodeUppercase(): void
    {
        // mb_strtolower handles multibyte chars; sanity-check that it's not a plain strtolower.
        $this->assertSame('élise@example.com', $this->svc->canonicalizeEmail('Élise@example.com'));
    }
}
