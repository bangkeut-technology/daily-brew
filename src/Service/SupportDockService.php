<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use SupportDock\SupportDockClient;

class SupportDockService
{
    private ?SupportDockClient $client = null;

    public function __construct(
        private LoggerInterface $logger,
        string $supportdockApiKey,
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
     */
    public function sendFeedback(
        string $type,
        string $message,
        ?string $email = null,
        ?string $name = null,
        ?string $subject = null,
        string $source = 'website',
        array $metadata = [],
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
}
