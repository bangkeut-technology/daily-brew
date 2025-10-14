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
        private readonly RoleRepository $roleRepository,
    )
    {
        parent::__construct($translator);
    }

    /**
     * Retrieves a list of roles.
     *
     * @return JsonResponse The JSON response containing the list of roles.
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

        return $this->createRoleResponse($roles);
    }

    /**
     * Creates a new role.
     *
     * @param Request $request The request object containing the role data.
     *
     * @return JsonResponse The JSON response containing the created role.
     */
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            ref: new Model(type: RoleFormType::class)
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

            return $this->createRoleResponse([
                'message' => $this->translator->trans('created.role', ['%name%' => $role]),
                'role' => $role,
            ], Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.role', domain: 'errors'));
    }

    /**
     * Updates an existing role.
     *
     * @param string  $publicId The public identifier of the role.
     *
     * @param Request $request  The request object containing the updated role data.
     *
     * @return JsonResponse The JSON response containing the updated role.
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The public identifier of the role.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            ref: new Model(type: RoleFormType::class)
        )
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
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
    #[Route('/{publicId}', name: 'put', methods: ['PUT'])]
    public function put(string $publicId, Request $request): JsonResponse
    {
        $role = $this->getRole($publicId);
        $form = $this->createForm(RoleFormType::class, $role);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $role->setUser($this->getUser());
            $this->roleRepository->update($role);
            return $this->createRoleResponse([
                'message' => $this->translator->trans('updated.role', ['%name%' => $role]),
                'role' => $role,
            ]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.role', domain: 'errors'));
    }

    /**
     * Retrieves a role by its public ID.
     *
     * @param string $publicId The public identifier of the role.
     *
     * @return JsonResponse The JSON response containing the role data.
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The public identifier of the role.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a role',
        content: new OA\JsonContent(
            ref: new Model(type: Role::class, groups: ['role:read'])
        )
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Role not found',
        content: new OA\JsonContent(
            properties: [
                'message' => new OA\Property(type: 'string', example: 'Role not found'),
            ]
        )
    )]
    #[Route('/{publicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId): JsonResponse
    {
        return $this->createRoleResponse($this->getRole($publicId));
    }

    /**
     * Deletes a role by its public ID.
     *
     * @param string $publicId The public identifier of the role.
     *
     * @return JsonResponse The JSON response containing the role data.
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The public identifier of the role.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a role',
        content: new OA\JsonContent(
            ref: new Model(type: Role::class, groups: ['role:read'])
        )
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Role not found',
        content: new OA\JsonContent(
            properties: [
                'message' => new OA\Property(type: 'string', example: 'Role not found'),
            ]
        )
    )]
    #[Route('/{publicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId): JsonResponse
    {
        $role = $this->getRole($publicId);

        $this->roleRepository->remove($role);

        return $this->createRoleResponse([
            'message' => $this->translator->trans('deleted.role', ['%name%' => $role]),
            'role' => $role,
        ]);
    }

    /**
     * Retrieves a role by its public ID and associated user.
     *
     * @param string $publicId The public identifier of the role.
     *
     * @return Role The role object if found, or throws NotFoundException if not found.
     */
    private function getRole(string $publicId): Role
    {
        $role = $this->roleRepository->findByPublicIdAndUser($publicId, $this->getUser());
        if (!$role) {
            throw $this->createNotFoundException($this->translator->trans('not_found.role', ['%publicId%' => $publicId], domain: 'errors'));
        }
        return $role;
    }

    /**
     * Creates a JSON response for a role.
     *
     * @param mixed $data       The data to be included in the response.
     * @param int   $statusCode The HTTP status code for the response.
     *
     * @return JsonResponse The JSON response with the provided data and status code.
     */
    private function createRoleResponse(mixed $data, int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return $this->json($data, status: $statusCode, context: ['groups' => 'role:read']);
    }
}
