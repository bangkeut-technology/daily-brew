<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Service\SupportDockService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

/**
 * Targeted tests for the path that doesn't require a real SupportDockClient:
 * the unconfigured (empty API key) branch where the service should degrade
 * gracefully without sending requests. Covering the configured-client path
 * would require constructor-level dependency injection of the client; that
 * refactor is intentionally deferred.
 */
class SupportDockServiceTest extends TestCase
{
    private LoggerInterface&MockObject $logger;
    private SupportDockService $svc;

    protected function setUp(): void
    {
        $this->logger = $this->createMock(LoggerInterface::class);
        // Empty API key → no internal client is created.
        $this->svc = new SupportDockService($this->logger, '');
    }

    public function testSendFeedbackReturnsFalseAndLogsWarningWhenApiKeyMissing(): void
    {
        $this->logger->expects($this->once())
            ->method('warning')
            ->with($this->stringContains('SupportDock API key not configured'));

        $result = $this->svc->sendFeedback(
            type: 'bug',
            message: 'Check-in broken on iOS 18',
            email: 'reporter@example.com',
            source: 'mobile-app',
        );

        $this->assertFalse($result, 'No API key → returns false so the caller can record local fallback');
    }

    public function testListFaqsReturnsEmptyArrayAndLogsWarningWhenApiKeyMissing(): void
    {
        $this->logger->expects($this->once())
            ->method('warning')
            ->with($this->stringContains('SupportDock API key not configured'));

        $faqs = $this->svc->listFAQs();

        $this->assertSame([], $faqs);
    }

    public function testSendFeedbackAcceptsAllOptionalArgumentsWithoutErrorEvenUnconfigured(): void
    {
        // Verify the optional-arg branches all evaluate without exceptions when
        // the client is missing — guards against future refactors that move
        // option assembly above the client-null check.
        $this->logger->expects($this->once())->method('warning');

        $result = $this->svc->sendFeedback(
            type: 'feature',
            message: 'Add export to CSV',
            email: 'a@b.com',
            name: 'Vandeth Tho',
            subject: 'Feature request',
            source: 'web',
            metadata: ['workspaceId' => 'pub-123', 'plan' => 'Espresso'],
            images: ['data:image/png;base64,abc='],
        );

        $this->assertFalse($result);
    }
}
