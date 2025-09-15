<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/**
 * Class PageController.
 *
 * A controller class for handling pages in a Symfony application.
 *
 * @author  Vandeth THO <thovandeth@gmailcom>
 */
#[Route(name: 'daily_brew_page_')]
class PageController extends AbstractController
{
    /**
     * Description: This method handles the index page route in the Symfony application.
     *
     * @return Response the rendered index page
     */
    #[Route(
        path: '/{route}',
        name: 'route',
        requirements: ['route' => '^(?!.*(api|logout|locales)).*'],
        defaults: ['route' => null],
        methods: ['GET']
    )]
    public function index(
        #[CurrentUser] ?User $user,
        int $maxFreeEmployees,
        int $maxFreeTemplates,
        bool $storeAllowed,
        string $contactEmail,
    ): Response {
        return $this->render('page/index.html.twig', [
            'user' => $user,
            'maxFreeEmployees' => $maxFreeEmployees,
            'maxFreeTemplates' => $maxFreeTemplates,
            'storeAllowed' => $storeAllowed,
            'contactEmail' => $contactEmail,
        ]);
    }
}
