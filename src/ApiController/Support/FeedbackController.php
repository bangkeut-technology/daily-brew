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

    private const array ALLOWED_TYPES = ['bug', 'feature', 'question', 'general'];
    private const int MAX_IMAGES = 3;
    private const string ALLOWED_IMAGE_PATTERN = '/^data:image\/(png|jpeg|webp|gif);base64,/';

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
        $name = trim($data['name'] ?? '');
        $message = trim($data['message'] ?? '');
        $email = trim($data['email'] ?? '');
        $subject = trim($data['subject'] ?? '');

        if (!in_array($type, self::ALLOWED_TYPES, true)) {
            return $this->jsonError('Invalid type. Must be one of: ' . implode(', ', self::ALLOWED_TYPES));
        }

        if ($message === '') {
            return $this->jsonError('Message is required');
        }

        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->jsonError('Invalid email address');
        }

        $images = $data['images'] ?? [];
        if (!is_array($images)) {
            return $this->jsonError('Images must be an array');
        }
        if (count($images) > self::MAX_IMAGES) {
            return $this->jsonError(sprintf('Maximum %d images allowed', self::MAX_IMAGES));
        }
        foreach ($images as $image) {
            if (!is_string($image) || !preg_match(self::ALLOWED_IMAGE_PATTERN, $image)) {
                return $this->jsonError('Images must be base64-encoded data URLs (PNG, JPEG, WebP, or GIF)');
            }
        }

        $success = $supportDock->sendFeedback(
            type: $type,
            message: $message,
            email: $email ?: null,
            name: $name ?: null,
            subject: $subject ?: null,
            source: 'website',
            metadata: [
                'page' => $data['page'] ?? '/support',
                'platform' => $request->headers->get('User-Agent', 'unknown'),
                'appVersion' => $this->getParameter('app.version'),
            ],
            images: $images,
        );

        if (!$success) {
            return $this->jsonError('Failed to submit feedback. Please try again later.', 502);
        }

        return $this->jsonSuccess(['submitted' => true]);
    }

    #[Route('/support/faqs', name: 'support_faqs', methods: ['GET'])]
    public function faqs(
        SupportDockService $supportDock,
    ): JsonResponse {
        return $this->jsonSuccess($supportDock->listFAQs());
    }
}
