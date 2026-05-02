<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class TelegramService
{
    private const string API_BASE = 'https://api.telegram.org/bot';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface     $logger,
        private readonly string              $telegramBotToken,
    ) {}

    /**
     * Send a text message to a Telegram chat. Errors are swallowed and logged
     * — callers driving background notifications shouldn't break on Telegram
     * being down.
     */
    public function send(string $chatId, string $text): void
    {
        $error = $this->sendForResult($chatId, $text);
        if ($error !== null) {
            $this->logger->error('Telegram notification failed', [
                'chatId' => $chatId,
                'error' => $error,
            ]);
        }
    }

    /**
     * Send a message and return the error description on failure, or null on
     * success. Use this for user-driven flows (e.g. the "send test" button)
     * where surfacing the failure reason matters.
     */
    public function sendForResult(string $chatId, string $text): ?string
    {
        if ($this->telegramBotToken === '') {
            return 'Telegram bot is not configured on the server.';
        }
        if ($chatId === '') {
            return 'No chat ID provided.';
        }

        $url = self::API_BASE . $this->telegramBotToken . '/sendMessage';

        try {
            $response = $this->httpClient->request('POST', $url, [
                'json' => [
                    'chat_id' => $chatId,
                    'text' => $text,
                    'parse_mode' => 'HTML',
                    'disable_web_page_preview' => true,
                ],
                'timeout' => 10.0,
            ]);

            $payload = $response->toArray(false);
            if (($payload['ok'] ?? false) === true) {
                return null;
            }
            return (string) ($payload['description'] ?? 'Unknown Telegram error');
        } catch (\Throwable $e) {
            return $e->getMessage();
        }
    }
}
