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
     * Send a text message to a Telegram chat.
     */
    public function send(string $chatId, string $text): void
    {
        if ($this->telegramBotToken === '' || $chatId === '') {
            return;
        }

        $url = self::API_BASE . $this->telegramBotToken . '/sendMessage';

        try {
            $this->httpClient->request('POST', $url, [
                'json' => [
                    'chat_id' => $chatId,
                    'text' => $text,
                    'parse_mode' => 'HTML',
                    'disable_web_page_preview' => true,
                ],
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Telegram notification failed', [
                'chatId' => $chatId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
