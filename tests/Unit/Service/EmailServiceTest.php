<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Service\EmailService;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;

#[AllowMockObjectsWithoutExpectations]
class EmailServiceTest extends TestCase
{
    private MailerInterface&MockObject $mailer;
    private LoggerInterface&MockObject $logger;
    private EmailService $svc;

    protected function setUp(): void
    {
        $this->mailer = $this->createMock(MailerInterface::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $this->svc = new EmailService($this->mailer, $this->logger, 'no-reply@dailybrew.work');
    }

    public function testSendBuildsTemplatedEmailWithCorrectFromToSubjectTemplateContext(): void
    {
        $captured = null;
        $this->mailer->expects($this->once())
            ->method('send')
            ->with($this->callback(function (TemplatedEmail $email) use (&$captured): bool {
                $captured = $email;
                return true;
            }));
        $this->logger->expects($this->never())->method('error');

        $this->svc->send(
            'owner@example.com',
            'Leave approved',
            'emails/leave_approved.html.twig',
            ['employeeName' => 'Lyhour'],
        );

        $this->assertSame('Leave approved', $captured->getSubject());
        $this->assertSame('emails/leave_approved.html.twig', $captured->getHtmlTemplate());
        $this->assertSame(['employeeName' => 'Lyhour'], $captured->getContext());
        $this->assertSame('no-reply@dailybrew.work', $captured->getFrom()[0]->getAddress());
        $this->assertSame('owner@example.com', $captured->getTo()[0]->getAddress());
    }

    public function testSendSwallowsMailerFailureAndLogsIt(): void
    {
        $this->mailer->method('send')->willThrowException(new \RuntimeException('SMTP refused'));
        $this->logger->expects($this->once())
            ->method('error')
            ->with(
                'Failed to send email',
                $this->callback(fn (array $ctx) =>
                    $ctx['to'] === 'owner@example.com'
                    && $ctx['subject'] === 'Subj'
                    && $ctx['error'] === 'SMTP refused'
                ),
            );

        // Must NOT throw — email failures cannot bubble up to interrupt the user flow.
        $this->svc->send('owner@example.com', 'Subj', 'tpl.html.twig');
    }

    public function testSendToManyDispatchesIndividuallyToEachRecipient(): void
    {
        $this->mailer->expects($this->exactly(3))->method('send');

        $this->svc->sendToMany(
            ['a@x.com', 'b@x.com', 'c@x.com'],
            'Daily summary',
            'emails/summary.html.twig',
            ['date' => '2026-04-10'],
        );
    }

    public function testSendToManyContinuesAfterFailureForOneRecipient(): void
    {
        $this->mailer->expects($this->exactly(3))
            ->method('send')
            ->willReturnOnConsecutiveCalls(
                null,
                $this->throwException(new \RuntimeException('temporary failure')),
                null,
            );
        $this->logger->expects($this->once())->method('error');

        $this->svc->sendToMany(['a@x.com', 'b@x.com', 'c@x.com'], 'S', 'tpl.html.twig');
    }

    public function testSendToManyOnEmptyArrayDoesNothing(): void
    {
        $this->mailer->expects($this->never())->method('send');

        $this->svc->sendToMany([], 'S', 'tpl.html.twig');
    }
}
