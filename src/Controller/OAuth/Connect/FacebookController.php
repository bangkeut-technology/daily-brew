<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 2/7/26 10:56AM
 * @see     https://adora.media
 * Copyright (c) 2026 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\Controller\OAuth\Connect;


use App\Enum\OAuthProviderEnum;
use App\Security\OAuthAuthenticationService;
use Exception;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use League\OAuth2\Client\Provider\GoogleUser;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Role\RoleHierarchyInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Vich\UploaderBundle\Templating\Helper\UploaderHelper;

/**
 *
 * Class GoogleController
 *
 * @package App\Controller\OAuth\Connect
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 */
#[Route('/facebook', name: 'facebook_')]
final class FacebookController extends AbstractOAuthConnectController
{
    public function __construct(
        TranslatorInterface        $translator,
        ClientRegistry             $clientRegistry,
        OAuthAuthenticationService $authenticationService,
        RoleHierarchyInterface     $roleHierarchy,
        UploaderHelper             $uploaderHelper,
    )
    {
        parent::__construct(
            $translator,
            'facebook_connect',
            OAuthProviderEnum::FACEBOOK,
            $clientRegistry,
            $authenticationService,
            $roleHierarchy,
            $uploaderHelper
        );
    }

    /**
     * {@inheritDoc}
     */
    #[Route(name: 'connect', methods: ['GET'], priority: 1000)]
    public function connect(): Response
    {
        return $this->getClient()
            ->redirect(['email', 'public_profile']);
    }

    /**
     * {@inheritDoc}
     * @throws Exception
     */
    #[Route(name: 'disconnect', methods: ['DELETE'], priority: 1000)]
    public function disconnect(): Response
    {
        return $this->disconnectHandler();
    }

    /**
     * {@inheritDoc}
     */
    #[Route('/callback', name: 'callback', methods: ['GET', 'POST'], priority: 1000)]
    public function callback(): Response
    {
        return $this->callbackHandler();
    }
}
