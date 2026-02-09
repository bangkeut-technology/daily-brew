<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 2/3/26 2:36PM
 * @see     https://adora.media
 * Copyright (c) 2026 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\Controller\OAuth\Auth;

use App\Controller\AbstractController;
use App\Enum\OAuthProviderEnum;
use App\Security\OAuthAuthenticationService;
use App\Security\OAuthUserData;
use Exception;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use League\OAuth2\Client\Provider\LinkedInResourceOwner;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 * Class LinkedInController
 *
 * @package App\Controller
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/linkedin', name: 'linkedIn_')]
class LinkedInController extends AbstractOAuthAuthController
{
    public function __construct(
        TranslatorInterface        $translator,
        ClientRegistry             $clientRegistry,
        OAuthAuthenticationService $authAuthenticationService,
    )
    {
        parent::__construct($translator, 'linkedIn_auth', OAuthProviderEnum::LINKEDIN, $clientRegistry, $authAuthenticationService);
    }

    #[Route(name: 'connect', methods: ['GET'], priority: 1000)]
    public function connect(): Response
    {
        return $this->getClient()
            ->redirect(['r_liteprofile', 'r_emailaddress']);
    }

    /**
     * {@inheritDoc}
     */
    #[Route('/callback', name: 'callback', methods: ['GET'], priority: 1000)]
    public function callback(): Response
    {
        return $this->callbackHandler();
    }
}
