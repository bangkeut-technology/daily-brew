<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Service\ExpoPushService;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[AllowMockObjectsWithoutExpectations]
class ExpoPushServiceTest extends TestCase
{
    private const string EXPO_URL = 'https://exp.host/--/api/v2/push/send';

    private HttpClientInterface&MockObject $httpClient;
    private LoggerInterface&MockObject $logger;
    private ExpoPushService $svc;

    protected function setUp(): void
    {
        $this->httpClient = $this->createMock(HttpClientInterface::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $this->svc = new ExpoPushService($this->httpClient, $this->logger);
    }

    public function testSendDoesNothingWhenTokenListIsEmpty(): void
    {
        $this->httpClient->expects($this->never())->method('request');

        $this->svc->send([], 'Title', 'Body');
    }

    public function testSendDoesNothingWhenAllTokensFiltered(): void
    {
        $this->httpClient->expects($this->never())->method('request');

        // array_filter drops empty strings, null, false → no real tokens left.
        $this->svc->send(['', null, false], 'Title', 'Body');
    }

    public function testSendDeduplicatesTokensInRequestPayload(): void
    {
        $captured = null;
        $this->httpClient->expects($this->once())
            ->method('request')
            ->with(
                'POST',
                self::EXPO_URL,
                $this->callback(function (array $opts) use (&$captured): bool {
                    $captured = $opts['json'];
                    return true;
                }),
            );

        $this->svc->send(['ExpoToken[A]', 'ExpoToken[A]', 'ExpoToken[B]'], 'T', 'B');

        $this->assertCount(2, $captured);
        $this->assertSame('ExpoToken[A]', $captured[0]['to']);
        $this->assertSame('ExpoToken[B]', $captured[1]['to']);
    }

    public function testSendBuildsExpoPayloadWithSoundTitleBodyAndOptionalData(): void
    {
        $captured = null;
        $this->httpClient->expects($this->once())
            ->method('request')
            ->with(
                'POST',
                self::EXPO_URL,
                $this->callback(function (array $opts) use (&$captured): bool {
                    $captured = $opts;
                    return true;
                }),
            );

        $this->svc->send(['ExpoToken[A]'], 'New leave', 'Sophea requested time off', [
            'type' => 'leave',
            'workspacePublicId' => 'ws-1',
        ]);

        $this->assertSame('application/json', $captured['headers']['Content-Type']);
        $this->assertSame('ExpoToken[A]', $captured['json'][0]['to']);
        $this->assertSame('default', $captured['json'][0]['sound']);
        $this->assertSame('New leave', $captured['json'][0]['title']);
        $this->assertSame('Sophea requested time off', $captured['json'][0]['body']);
        $this->assertSame(['type' => 'leave', 'workspacePublicId' => 'ws-1'], $captured['json'][0]['data']);
    }

    public function testSendOmitsDataKeyWhenNotProvided(): void
    {
        $captured = null;
        $this->httpClient->expects($this->once())
            ->method('request')
            ->with('POST', self::EXPO_URL, $this->callback(function (array $opts) use (&$captured): bool {
                $captured = $opts['json'][0];
                return true;
            }));

        $this->svc->send(['ExpoToken[A]'], 'T', 'B');

        $this->assertArrayNotHasKey('data', $captured);
    }

    public function testSendSplitsLargeTokenListsIntoBatchesOfOneHundred(): void
    {
        $tokens = array_map(fn (int $i) => "ExpoToken[$i]", range(1, 250));

        $batchSizes = [];
        $this->httpClient->expects($this->exactly(3))
            ->method('request')
            ->with('POST', self::EXPO_URL, $this->callback(function (array $opts) use (&$batchSizes): bool {
                $batchSizes[] = count($opts['json']);
                return true;
            }));

        $this->svc->send($tokens, 'T', 'B');

        $this->assertSame([100, 100, 50], $batchSizes);
    }

    public function testSendSwallowsHttpFailureAndLogsTokenCount(): void
    {
        $this->httpClient->method('request')->willThrowException(new \RuntimeException('Expo down'));
        $this->logger->expects($this->once())
            ->method('error')
            ->with(
                'Expo push notification failed',
                $this->callback(fn (array $ctx) =>
                    $ctx['error'] === 'Expo down' && $ctx['tokenCount'] === 2
                ),
            );

        // Must NOT throw — push failures cannot interrupt the caller.
        $this->svc->send(['T1', 'T2'], 'T', 'B');
    }
}
