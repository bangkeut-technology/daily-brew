<?php

declare(strict_types=1);

namespace App\ApiController\Support;

use App\ApiController\Trait\ApiResponseTrait;
use App\Service\SupportDockService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class FeedbackController extends AbstractController
{
    use ApiResponseTrait;

    private const ALLOWED_TYPES = ['bug', 'feature', 'question', 'general'];

    #[Route('/support/feedback', name: 'support_feedback', methods: ['POST'])]
    public function submit(
        Request $request,
        SupportDockService $supportDock,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if ($data === null) {
            return $this->jsonError('Invalid JSON');
        }

        $type = $data['type'] ?? '';
        $message = trim($data['message'] ?? '');
        $email = trim($data['email'] ?? '');

        if (!in_array($type, self::ALLOWED_TYPES, true)) {
            return $this->jsonError('Invalid type. Must be one of: ' . implode(', ', self::ALLOWED_TYPES));
        }

        if ($message === '') {
            return $this->jsonError('Message is required');
        }

        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->jsonError('Invalid email address');
        }

        $success = $supportDock->sendFeedback(
            type: $type,
            message: $message,
            email: $email ?: null,
            source: 'website',
            metadata: ['page' => $data['page'] ?? '/support'],
        );

        if (!$success) {
            return $this->jsonError('Failed to submit feedback. Please try again later.', 502);
        }

        return $this->jsonSuccess(['submitted' => true]);
    }
}
