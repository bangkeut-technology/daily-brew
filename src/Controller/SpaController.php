<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class SpaController extends AbstractController
{
    #[Route('/{reactRouting}', name: 'app_spa', requirements: ['reactRouting' => '(?!api).*'], priority: -1)]
    public function index(
        int $maxFreeEmployees,
        string $contactEmail,
        string $googleClientId,
        string $appleClientId,
    ): Response {
        return $this->render('page/index.html.twig', [
            'maxFreeEmployees' => $maxFreeEmployees,
            'contactEmail' => $contactEmail,
            'googleClientId' => $googleClientId,
            'appleClientId' => $appleClientId,
        ]);
    }
}
