<?php

namespace App\ApiController\Auth;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\UserRepository;
use App\Service\JwtResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/auth')]
class LoginController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/login', name: 'auth_login', methods: ['POST'])]
    public function login(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        JwtResponseService $jwtResponse,
    ): Response {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            return $this->jsonError('Email and password are required');
        }

        $user = $userRepository->findByEmail($email);
        if ($user === null || !$passwordHasher->isPasswordValid($user, $password)) {
            return $this->jsonError('Invalid credentials', 401);
        }

        return $jwtResponse->createAuthResponse($user);
    }
}
