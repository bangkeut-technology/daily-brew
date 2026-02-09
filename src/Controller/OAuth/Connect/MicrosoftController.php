<?php
/**
 * This file is part of the DailyBrew project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 2/7/26 10:56AM
 * @see     https://dailybrew.work
 * Copyright (c) 2026 DailyBrew. All rights reserved.
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
 * Class MicrosoftController
 *
 * @package App\Controller\OAuth\Connect
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 */
#[Route('/microsoft', name: 'microsoft_')]
final class MicrosoftController extends AbstractOAuthConnectController
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
            'microsoft_connect',
            OAuthProviderEnum::MICROSOFT,
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
        return parent::connect();
    }

    /**
     * {@inheritDoc}
     * @throws Exception
     */
    #[Route(name: 'disconnect', methods: ['DELETE'], priority: 1000)]
    public function disconnect(): Response
    {
        return parent::disconnect();
    }

    /**
     * {@inheritDoc}
     */
    #[Route('/callback', name: 'callback', methods: ['GET', 'POST'], priority: 1000)]
    public function callback(): Response
    {
        return parent::callback();
    }
}
