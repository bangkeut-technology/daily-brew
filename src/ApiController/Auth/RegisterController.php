<?php

namespace App\ApiController\Auth;

use App\ApiController\Trait\ApiResponseTrait;
use App\Service\AuthService;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Http\Authentication\AuthenticationSuccessHandler;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/auth')]
class RegisterController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/register', name: 'auth_register', methods: ['POST'])]
    public function register(
        Request $request,
        AuthService $authService,
        AuthenticationSuccessHandler $authenticationSuccessHandler,
    ): Response {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $firstName = $data['firstName'] ?? null;
        $lastName = $data['lastName'] ?? null;

        if (empty($email) || empty($password)) {
            return $this->jsonError('Email and password are required');
        }

        if (strlen($password) < 8) {
            return $this->jsonError('Password must be at least 8 characters');
        }

        try {
            $user = $authService->register($email, $password, $firstName, $lastName);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 409);
        }

        return $authenticationSuccessHandler->handleAuthenticationSuccess($user);
    }
}
