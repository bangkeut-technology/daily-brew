<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class SpaController extends AbstractController
{
    #[Route('/{reactRouting}', name: 'app_spa', requirements: ['reactRouting' => '(?!api).*'], priority: -1)]
    public function index(
        int $maxFreeEmployees,
        string $contactEmail,
        string $googleClientId,
        string $appleClientId,
        #[CurrentUser]
        ?User $user = null,
    ): Response {
        $userData = null;
        if ($user !== null) {
            $userData = [
                'publicId' => $user->getPublicId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'fullName' => $user->getFullName(),
                'locale' => $user->getLocale(),
                'onboardingCompleted' => $user->isOnboardingCompleted(),
            ];
        }

        return $this->render('page/index.html.twig', [
            'maxFreeEmployees' => $maxFreeEmployees,
            'contactEmail' => $contactEmail,
            'googleClientId' => $googleClientId,
            'appleClientId' => $appleClientId,
            'user' => $userData,
        ]);
    }
}
