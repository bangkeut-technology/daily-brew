<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 2/3/26 2:36PM
 * @see     https://dailybrew.work
 * Copyright (c) 2026 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\Controller\OAuth\Auth;

use App\Enum\OAuthProviderEnum;
use App\Security\OAuthAuthenticationService;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 * Class LinkedInController
 *
 * @package App\Controller\OAuth\Auth
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/linkedin', name: 'linkedin_')]
final class LinkedInController extends AbstractOAuthAuthController
{
    public function __construct(
        TranslatorInterface        $translator,
        ClientRegistry             $clientRegistry,
        OAuthAuthenticationService $authAuthenticationService,
    )
    {
        parent::__construct(
            $translator,
            'linkedin_auth',
            OAuthProviderEnum::LINKEDIN,
            $clientRegistry,
            $authAuthenticationService
        );
    }

    /**
     * {@inheritDoc}
     */
    #[Route(name: 'connect', methods: ['GET'], priority: 1000)]
    public function connect(): Response
    {
        return parent::connect();
    }

    /**
     * {@inheritDoc}
     */
    #[Route('/callback', name: 'callback', methods: ['GET'], priority: 1000)]
    public function callback(): Response
    {
        return parent::callback();
    }
}
