<?php

declare(strict_types=1);

namespace App\Service\Seo;

/**
 * Server-resolved SEO metadata for a single request path.
 *
 * `canonical` is null for pages that should not advertise a canonical URL
 * (private app routes and unknown paths). `statusCode` is 404 for unknown
 * paths so search engines drop them instead of flagging a soft 404.
 */
final readonly class SeoMeta
{
    public function __construct(
        public string $title,
        public string $description,
        public ?string $canonical,
        public bool $index,
        public int $statusCode,
    ) {
    }

    public function robots(): ?string
    {
        return $this->index ? null : 'noindex, follow';
    }
}
