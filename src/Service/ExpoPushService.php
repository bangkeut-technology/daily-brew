<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ExpoPushService
{
    private const string EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
    private const int BATCH_SIZE = 100;

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface     $logger,
    )
    {
    }

    /**
     * Send a push notification to one or more Expo push tokens.
     *
     * @param string[] $tokens
     */
    public function send(
        array  $tokens,
        string $title,
        string $body,
        ?array $data = null,
    ): void
    {
        $tokens = array_values(array_unique(array_filter($tokens)));
        if (empty($tokens)) {
            return;
        }

        $batches = array_chunk($tokens, self::BATCH_SIZE);

        foreach ($batches as $batch) {
            $messages = array_map(
                fn(string $token) => array_filter([
                    'to'    => $token,
                    'sound' => 'default',
                    'title' => $title,
                    'body'  => $body,
                    'data'  => $data,
                ]),
                $batch,
            );

            try {
                $this->httpClient->request('POST', self::EXPO_PUSH_URL, [
                    'json'    => $messages,
                    'headers' => [
                        'Accept'       => 'application/json',
                        'Content-Type' => 'application/json',
                    ],
                ]);
            } catch (\Throwable $e) {
                $this->logger->error('Expo push notification failed', [
                    'error'      => $e->getMessage(),
                    'tokenCount' => count($batch),
                ]);
            }
        }
    }
}
