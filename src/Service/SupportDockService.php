<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use SupportDock\SupportDockClient;

class SupportDockService
{
    private ?SupportDockClient $client = null;

    public function __construct(
        private readonly LoggerInterface $logger,
        string                           $supportdockApiKey,
    ) {
        if ($supportdockApiKey !== '') {
            $this->client = new SupportDockClient([
                'apiKey' => $supportdockApiKey,
                'defaultMetadata' => ['product' => 'dailybrew'],
            ]);
        }
    }

    /**
     * Forward feedback to SupportDock.
     *
     * @param string      $type     bug|feature|question|general
     * @param string      $message  The feedback body
     * @param string|null $email    Sender email
     * @param string|null $name     Sender name
     * @param string|null $subject  Email subject (for inbound emails)
     * @param string      $source   Origin identifier
     * @param array       $metadata Extra context
     * @param string[]    $images   Base64 data-URL images (max 3)
     */
    public function sendFeedback(
        string $type,
        string $message,
        ?string $email = null,
        ?string $name = null,
        ?string $subject = null,
        string $source = 'website',
        array $metadata = [],
        array $images = [],
    ): bool {
        $options = [
            'type' => $type,
            'message' => $message,
            'source' => $source,
        ];

        if ($email !== null && $email !== '') {
            $options['email'] = $email;
        }
        if ($name !== null && $name !== '') {
            $options['name'] = $name;
        }
        if ($subject !== null && $subject !== '') {
            $options['subject'] = $subject;
        }
        if (!empty($metadata)) {
            $options['metadata'] = $metadata;
        }
        if (!empty($images)) {
            $options['images'] = $images;
        }

        if ($this->client === null) {
            $this->logger->warning('SupportDock API key not configured, skipping feedback');

            return false;
        }

        try {
            $this->client->sendFeedback($options);

            return true;
        } catch (\Throwable $e) {
            $this->logger->error('SupportDock feedback failed', [
                'error' => $e->getMessage(),
                'type' => $type,
                'source' => $source,
            ]);

            return false;
        }
    }

    /**
     * @return array<int, array{id: string, question: string, answer: string, sortOrder: int}>
     */
    public function listFAQs(): array
    {
        if ($this->client === null) {
            $this->logger->warning('SupportDock API key not configured, skipping FAQ fetch');

            return [];
        }

        try {
            return $this->client->listFAQs();
        } catch (\Throwable $e) {
            $this->logger->error('SupportDock FAQ fetch failed', [
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }
}
