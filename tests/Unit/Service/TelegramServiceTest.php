<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Service\TelegramService;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

#[AllowMockObjectsWithoutExpectations]
class TelegramServiceTest extends TestCase
{
    private const string BOT_TOKEN = 'TEST:bot-token';
    private const string EXPECTED_URL = 'https://api.telegram.org/botTEST:bot-token/sendMessage';

    private HttpClientInterface&MockObject $httpClient;
    private LoggerInterface&MockObject $logger;
    private TelegramService $svc;

    protected function setUp(): void
    {
        $this->httpClient = $this->createMock(HttpClientInterface::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $this->svc = new TelegramService($this->httpClient, $this->logger, self::BOT_TOKEN);
    }

    public function testSendForResultRejectsEmptyBotToken(): void
    {
        $svc = new TelegramService($this->httpClient, $this->logger, '');
        $this->httpClient->expects($this->never())->method('request');

        $error = $svc->sendForResult('@chat', 'hello');

        $this->assertSame('Telegram bot is not configured on the server.', $error);
    }

    public function testSendForResultRejectsEmptyChatId(): void
    {
        $this->httpClient->expects($this->never())->method('request');

        $error = $this->svc->sendForResult('', 'hello');

        $this->assertSame('No chat ID provided.', $error);
    }

    public function testSendForResultPostsHtmlMessageWithDisabledPreview(): void
    {
        $response = $this->createConfiguredMock(ResponseInterface::class, [
            'toArray' => ['ok' => true, 'result' => ['message_id' => 1]],
        ]);
        $this->httpClient->expects($this->once())
            ->method('request')
            ->with(
                'POST',
                self::EXPECTED_URL,
                $this->callback(function (array $opts): bool {
                    return $opts['json']['chat_id'] === '@chat'
                        && $opts['json']['text'] === '<b>hello</b>'
                        && $opts['json']['parse_mode'] === 'HTML'
                        && $opts['json']['disable_web_page_preview'] === true
                        && $opts['timeout'] === 10.0;
                }),
            )
            ->willReturn($response);

        $this->assertNull($this->svc->sendForResult('@chat', '<b>hello</b>'));
    }

    public function testSendForResultReturnsTelegramErrorDescription(): void
    {
        $response = $this->createConfiguredMock(ResponseInterface::class, [
            'toArray' => ['ok' => false, 'description' => 'Forbidden: bot blocked by user'],
        ]);
        $this->httpClient->method('request')->willReturn($response);

        $error = $this->svc->sendForResult('@chat', 'hi');

        $this->assertSame('Forbidden: bot blocked by user', $error);
    }

    public function testSendForResultFallsBackToGenericErrorWhenDescriptionMissing(): void
    {
        $response = $this->createConfiguredMock(ResponseInterface::class, [
            'toArray' => ['ok' => false],
        ]);
        $this->httpClient->method('request')->willReturn($response);

        $error = $this->svc->sendForResult('@chat', 'hi');

        $this->assertSame('Unknown Telegram error', $error);
    }

    public function testSendForResultReturnsExceptionMessageOnHttpFailure(): void
    {
        $this->httpClient->method('request')->willThrowException(new \RuntimeException('connection refused'));

        $error = $this->svc->sendForResult('@chat', 'hi');

        $this->assertSame('connection refused', $error);
    }

    public function testSendLogsErrorOnFailureButDoesNotThrow(): void
    {
        $this->httpClient->method('request')->willThrowException(new \RuntimeException('Telegram down'));
        $this->logger->expects($this->once())
            ->method('error')
            ->with(
                'Telegram notification failed',
                $this->callback(fn (array $ctx) =>
                    $ctx['chatId'] === '@chat' && $ctx['error'] === 'Telegram down'
                ),
            );

        // Must NOT throw — background notifications shouldn't break on Telegram outage.
        $this->svc->send('@chat', 'hi');
    }

    public function testSendDoesNotLogErrorOnSuccess(): void
    {
        $response = $this->createConfiguredMock(ResponseInterface::class, [
            'toArray' => ['ok' => true],
        ]);
        $this->httpClient->method('request')->willReturn($response);
        $this->logger->expects($this->never())->method('error');

        $this->svc->send('@chat', 'hi');
    }
}
