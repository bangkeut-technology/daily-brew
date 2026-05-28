<?php

declare(strict_types=1);

namespace App\Service\Seo;

/**
 * Server-resolved SEO metadata for a single request path.
 *
 * `canonical` is null for pages that should not advertise a canonical URL
 * (private app routes and unknown paths). `statusCode` is 404 for unknown
 * paths so search engines drop them instead of flagging a soft 404.
 *
 * `locale` is the resolved UI/SEO language ('en', 'fr', or 'km') used both
 * to pick the right title/description and to emit the `<html lang="…">` tag.
 *
 * `alternates` is a map of language code => absolute URL for hreflang
 * variants. Empty for unindexable pages; populated for every indexable page
 * with one entry per supported locale plus an `x-default` pointer.
 */
final readonly class SeoMeta
{
    /**
     * @param array<string, string> $alternates locale code => absolute URL (incl. x-default)
     */
    public function __construct(
        public string $title,
        public string $description,
        public ?string $canonical,
        public bool $index,
        public int $statusCode,
        public string $locale = 'en',
        public array $alternates = [],
    ) {
    }

    public function robots(): ?string
    {
        return $this->index ? null : 'noindex, follow';
    }
}
