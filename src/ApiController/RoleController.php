<?php
declare(strict_types=1);

namespace App\ApiController;

use App\Controller\AbstractController;
use App\Entity\Role;
use App\Form\RoleFormType;
use App\Repository\RoleRepository;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
        TranslatorInterface             $translator,
        private readonly RoleRepository $roleRepository
    )
    {
        parent::__construct($translator);
    }

    /**
     * Gets a list of roles.
     *
     * @return JsonResponse
     */
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

    public function post(Request $request): JsonResponse
    {
        $role = $this->roleRepository->create();
        $form = $this->createForm(RoleFormType::class, $role);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $this->roleRepository->update($role);

            return $this->json([
                'message' => $this->translator->trans('created.role', ['%role%' => $role]),
                'role' => $role
            ], context: ['groups' => 'role:read']);
        }

        return $this->json([
            'message' => $this->translator->trans('invalid.role', domain: 'errors'),
        ],
            Response::HTTP_BAD_REQUEST,
        );
    }
}
