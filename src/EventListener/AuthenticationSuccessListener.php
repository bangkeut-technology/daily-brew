<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;

/**
 * Adds user data to the JWT authentication success response.
 * Listens to lexik_jwt_authentication.on_authentication_success.
 */
final class AuthenticationSuccessListener
{
    public function onAuthenticationSuccessResponse(AuthenticationSuccessEvent $event): void
    {
        $data = $event->getData();
        $user = $event->getUser();

        if (!$user instanceof User) {
            return;
        }

        $data['user'] = [
            'publicId' => (string) $user->getPublicId(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'fullName' => $user->getFullName(),
            'locale' => $user->getLocale(),
            'onboardingCompleted' => $user->isOnboardingCompleted(),
        ];

        $event->setData($data);
    }
}
