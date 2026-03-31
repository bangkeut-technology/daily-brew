<?php

declare(strict_types=1);

namespace App\Controller\OAuth\Auth;

use App\Enum\OAuthProviderEnum;
use App\Security\OAuthAuthenticationService;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/apple', name: 'apple_')]
final class AppleController extends AbstractOAuthAuthController
{
    public function __construct(
        ClientRegistry             $clientRegistry,
        OAuthAuthenticationService $authenticationService,
        LoggerInterface            $logger,
    ) {
        parent::__construct(
            'apple_auth',
            OAuthProviderEnum::APPLE,
            $clientRegistry,
            $authenticationService,
            $logger,
        );
    }

    #[Route(name: 'connect', methods: ['GET'], priority: 1000)]
    public function connect(): Response
    {
        return parent::connect();
    }

    #[Route('/callback', name: 'callback', methods: ['GET', 'POST'], priority: 1000)]
    public function callback(Request $request): Response
    {
        return parent::callback($request);
    }
}
