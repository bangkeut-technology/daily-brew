<?php
declare(strict_types=1);

namespace App\ApiController;

use App\Controller\AbstractController;
use App\Entity\Role;
use App\Repository\RoleRepository;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class RoleController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/roles', name: 'roles_')]
#[OA\Tag(name: 'Roles')]
class RoleController extends AbstractController
{
    public function __construct(
        TranslatorInterface $translator,
        private readonly RoleRepository $roleRepository
    ) {
        parent::__construct($translator);
    }

    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a list of roles',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: Role::class, groups: ['role:read']))
        )
    )]
    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(): JsonResponse
    {
        $roles = $this->roleRepository->findAll();
        return $this->json($roles, context: ['groups' => 'role:read']);
    }
}
