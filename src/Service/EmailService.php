<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

class EmailService
{
    private Address $from;

    public function __construct(
        private MailerInterface $mailer,
        private LoggerInterface $logger,
        string $noReplyEmail,
    ) {
        $this->from = Address::create($noReplyEmail);
    }

    /**
     * @param array<string, mixed> $context
     */
    public function send(
        string $to,
        string $subject,
        string $template,
        array $context = [],
    ): void {
        $email = (new TemplatedEmail())
            ->from($this->from)
            ->to($to)
            ->subject($subject)
            ->htmlTemplate($template)
            ->context($context);

        try {
            $this->mailer->send($email);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to send email', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * @param string[]             $recipients
     * @param array<string, mixed> $context
     */
    public function sendToMany(
        array $recipients,
        string $subject,
        string $template,
        array $context = [],
    ): void {
        foreach ($recipients as $to) {
            $this->send($to, $subject, $template, $context);
        }
    }
}
