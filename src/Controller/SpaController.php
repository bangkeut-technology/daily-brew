<?php

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
        #[CurrentUser] ?User $user,
        int $maxFreeEmployees,
        string $contactEmail,
    ): Response {
        return $this->render('page/index.html.twig', [
            'user' => $user,
            'maxFreeEmployees' => $maxFreeEmployees,
            'contactEmail' => $contactEmail,
        ]);
    }
}
