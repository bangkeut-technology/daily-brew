<?php

declare(strict_types=1);

namespace App\ApiController\Support;

use App\ApiController\Trait\ApiResponseTrait;
use App\Service\SupportDockService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class MailgunInboundController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/webhooks/mailgun/inbound', name: 'mailgun_inbound', methods: ['POST'])]
    public function inbound(
        Request $request,
        SupportDockService $supportDock,
        LoggerInterface $logger,
        string $mailgunWebhookSigningKey,
    ): JsonResponse {
        // Mailgun posts multipart form data for inbound routes
        $timestamp = $request->request->get('timestamp', '');
        $token = $request->request->get('token', '');
        $signature = $request->request->get('signature', '');

        if ($mailgunWebhookSigningKey !== '' && !$this->verifyMailgunSignature($timestamp, $token, $signature, $mailgunWebhookSigningKey)) {
            $logger->warning('Mailgun inbound: invalid signature');

            return $this->jsonError('Invalid signature', 403);
        }

        $sender = $request->request->get('sender', '');
        $from = $request->request->get('from', '');
        $subject = $request->request->get('subject', '');
        $bodyPlain = $request->request->get('body-plain', '');

        if ($bodyPlain === '') {
            return $this->jsonSuccess(['received' => true, 'skipped' => 'empty body']);
        }

        $type = $this->detectType($subject);
        $email = $sender !== '' ? $sender : $this->extractEmail($from);

        $name = $this->extractName($from);

        $supportDock->sendFeedback(
            type: $type,
            message: $bodyPlain,
            email: $email ?: null,
            name: $name ?: null,
            subject: $subject ?: null,
            source: 'email',
            metadata: ['from' => $from],
        );

        $logger->info('Mailgun inbound forwarded to SupportDock', [
            'from' => $from,
            'subject' => $subject,
        ]);

        return $this->jsonSuccess(['received' => true]);
    }

    private function verifyMailgunSignature(string $timestamp, string $token, string $signature, string $signingKey): bool
    {
        if ($timestamp === '' || $token === '' || $signature === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp . $token, $signingKey);

        return hash_equals($expected, $signature);
    }

    private function detectType(string $subject): string
    {
        $lower = mb_strtolower($subject);

        if (str_contains($lower, 'bug') || str_contains($lower, 'issue') || str_contains($lower, 'error')) {
            return 'bug';
        }

        if (str_contains($lower, 'feature') || str_contains($lower, 'request') || str_contains($lower, 'suggestion')) {
            return 'feature';
        }

        if (str_contains($lower, 'question') || str_contains($lower, 'how') || str_contains($lower, 'help')) {
            return 'question';
        }

        return 'general';
    }

    private function extractEmail(string $from): string
    {
        // "John Doe <john@example.com>" → "john@example.com"
        if (preg_match('/<([^>]+)>/', $from, $matches)) {
            return $matches[1];
        }

        return $from;
    }

    private function extractName(string $from): string
    {
        // "John Doe <john@example.com>" → "John Doe"
        if (preg_match('/^(.+?)\s*</', $from, $matches)) {
            return trim($matches[1], ' "\'');
        }

        return '';
    }
}
