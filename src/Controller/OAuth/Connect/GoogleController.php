<?php

declare(strict_types=1);

namespace App\Controller\OAuth\Connect;

use App\Enum\OAuthProviderEnum;
use App\Repository\UserRepository;
use App\Security\OAuthAuthenticationService;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/google', name: 'google_')]
final class GoogleController extends AbstractOAuthConnectController
{
    public function __construct(
        ClientRegistry             $clientRegistry,
        OAuthAuthenticationService $authenticationService,
        JWTEncoderInterface        $jwtEncoder,
        UserRepository             $userRepository,
    ) {
        parent::__construct(
            'google_connect',
            OAuthProviderEnum::GOOGLE,
            $clientRegistry,
            $authenticationService,
            $jwtEncoder,
            $userRepository,
        );
    }

    #[Route(name: 'connect', methods: ['GET'], priority: 1000)]
    public function connect(): Response
    {
        return parent::connect();
    }

    #[Route(name: 'disconnect', methods: ['DELETE', 'GET'], priority: 1000)]
    public function disconnect(Request $request): Response
    {
        return parent::disconnect($request);
    }

    #[Route('/callback', name: 'callback', methods: ['GET', 'POST'], priority: 1000)]
    public function callback(Request $request): Response
    {
        return parent::callback($request);
    }
}
