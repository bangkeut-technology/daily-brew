<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/**
 * Class SecurityController.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/console', name: 'daily_brew_security_')]
class SecurityController extends AbstractController
{
    /**
     * Description: This method handles the login page route in the Symfony application.
     *
     * @param User|null $user The current user.
     *                        If the user is not authenticated, this parameter will be null.
     *
     * @return JsonResponse the rendered login page
     */
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json([
                'message' => 'Invalid credentials',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'message' => 'authenticated',
            'user' => $user,
        ], context: ['groups' => 'user:read']);
    }

    /**
     * Description: This method handles the logout page route in the Symfony application.
     */
    #[Route('/logout', name: 'logout', methods: ['GET'])]
    public function logout()
    {
        // This method is intentionally empty.
    }
}
