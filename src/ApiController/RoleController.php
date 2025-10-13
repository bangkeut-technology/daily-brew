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
        TranslatorInterface $translator,
        private readonly RoleRepository $roleRepository,
    ) {
        parent::__construct($translator);
    }

    /**
     * Gets a list of roles.
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
        $roles = $this->roleRepository->findByUser($this->getUser());

        return $this->json($roles, context: ['groups' => 'role:read']);
    }

    /**
     * Creates a new role.
     *
     * @param Request $request
     * @return JsonResponse
     */
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            ref: new Model(type: RoleFormType::class, groups: ['role:create'])
        )
    )]
    #[OA\Response(
        response: Response::HTTP_CREATED,
        description: 'Role created successfully',
        content: new OA\JsonContent(
            ref: new Model(type: Role::class, groups: ['role:read'])
        )
    )]
    #[OA\Response(
        response: Response::HTTP_BAD_REQUEST,
        description: 'Invalid role data',
        content: new OA\JsonContent(
            properties: [
                'message' => new OA\Property(type: 'string', example: 'Invalid role data'),
            ],
            type: 'object'
        )
    )]
    #[Route(name: 'post', methods: ['POST'])]
    public function post(Request $request): JsonResponse
    {
        $role = $this->roleRepository->create();
        $form = $this->createForm(RoleFormType::class, $role);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $role->setUser($this->getUser());
            $this->roleRepository->update($role);

            return $this->json([
                'message' => $this->translator->trans('created.role', ['%name%' => $role]),
                'role' => $role,
            ], context: ['groups' => 'role:read']);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.role', domain: 'errors'));
    }
}
