<?php

declare(strict_types=1);

namespace App\ApiController\Auth;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/auth')]
class PasswordResetController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/forgot-password', name: 'auth_forgot_password', methods: ['POST'])]
    public function forgotPassword(
        Request $request,
        UserRepository $userRepository,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';

        if (empty($email)) {
            return $this->jsonError('Email is required');
        }

        $user = $userRepository->findByEmail($email);

        // Always return success to prevent email enumeration
        if ($user === null) {
            return $this->jsonSuccess(['message' => 'If an account exists, a reset link has been sent.']);
        }

        $token = bin2hex(random_bytes(32));
        $user->setPasswordResetToken($token);
        $user->setPasswordResetExpiresAt(\App\Service\DateService::relative('+1 hour'));
        $userRepository->flush();

        // In production, send email here. In dev mode, return the token.
        $response = ['message' => 'If an account exists, a reset link has been sent.'];

        if ($this->getParameter('kernel.debug')) {
            $response['_debug_token'] = $token;
        }

        return $this->jsonSuccess($response);
    }

    #[Route('/reset-password', name: 'auth_reset_password', methods: ['POST'])]
    public function resetPassword(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($token) || empty($password)) {
            return $this->jsonError('Token and password are required');
        }

        if (strlen($password) < 8) {
            return $this->jsonError('Password must be at least 8 characters');
        }

        $user = $userRepository->findOneBy(['passwordResetToken' => $token]);

        if ($user === null) {
            return $this->jsonError('Invalid or expired reset token', 400);
        }

        if ($user->getPasswordResetExpiresAt() < \App\Service\DateService::now()) {
            $user->setPasswordResetToken(null);
            $user->setPasswordResetExpiresAt(null);
            $userRepository->flush();
            return $this->jsonError('Reset token has expired', 400);
        }

        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $user->setPasswordResetToken(null);
        $user->setPasswordResetExpiresAt(null);
        $userRepository->flush();

        return $this->jsonSuccess(['message' => 'Password has been reset successfully']);
    }
}
