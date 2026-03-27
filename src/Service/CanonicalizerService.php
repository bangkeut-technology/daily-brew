<?php

namespace App\Service;

use Symfony\Component\String\Slugger\AsciiSlugger;

class CanonicalizerService
{
    private AsciiSlugger $slugger;

    public function __construct()
    {
        $this->slugger = new AsciiSlugger();
    }

    public function canonicalizeName(string $name): string
    {
        return $this->slugger->slug($name)->lower()->toString();
    }

    public function canonicalizeEmail(string $email): string
    {
        return mb_strtolower($email);
    }
}
