<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EmployeeTrait;
use App\ApiController\Trait\UserTrait;
use App\ApiController\Trait\WorkspaceTrait;
use App\Controller\AbstractController;
use App\DTO\WorkspaceDTO;
use App\Entity\User;
use App\Factory\DTO\WorkspaceDTOFactory;
use App\Form\ChangePasswordFormType;
use App\Form\ImageProfileFormType;
use App\Form\UserFormType;
use App\Repository\EmployeeRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceUserRepository;
use App\Service\AccountDeletionService;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class UserController.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/users', name: 'users_')]
#[OA\Tag(name: 'User')]
class UserController extends AbstractController
{
    use UserTrait;
    use EmployeeTrait;
    use WorkspaceTrait;

    /**
     * Constructs a new instance of the class.
     *
     * @param TranslatorInterface     $translator              the translator component
     * @param UserRepository          $userRepository          the repository for user data
     * @param EmployeeRepository      $employeeRepository      the repository for employee data
     * @param WorkspaceUserRepository $workspaceUserRepository the repository for workspace user data
     * @param WorkspaceDTOFactory     $workspaceDTOFactory     the factory for workspace DTOs
     * @param AccountDeletionService  $accountDeletionService  the service for account deletion
     */
    public function __construct(
        TranslatorInterface                      $translator,
        private readonly UserRepository          $userRepository,
        private readonly EmployeeRepository      $employeeRepository,
        private readonly WorkspaceUserRepository $workspaceUserRepository,
        private readonly WorkspaceDTOFactory     $workspaceDTOFactory,
        private readonly AccountDeletionService $accountDeletionService,
    )
    {
        parent::__construct($translator);
    }

    /**
     * Retrieves the information of the authenticated user.
     *
     * This method returns the information of the authenticated user. If the user is authenticated, a JSON response
     * with the user information is returned. If the user is not authenticated, a JSON response with a "null" value is
     * returned.
     *
     * @param User $user an authenticated user
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns the authenticated user information.',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(ref: new Model(type: User::class, groups: ['user:read']), description: 'The authenticated user information.'),
        )
    )]
    #[Route(path: '/me', name: 'me', methods: ['GET'])]
    public function getMe(#[CurrentUser] User $user): Response
    {
        return $this->createUserResponse($user);
    }

    /**
     * Updates a user.
     *
     * @param Request $request the request object
     *
     * @return Response the JSON response object with a message indicating the user has been updated
     */
    #[OA\RequestBody(content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(ref: new Model(type: UserFormType::class), description: 'The user data to update.'),
    ))]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a message indicating the user has been updated.',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'message', description: 'A message indicating the user has been updated.', type: 'string'),
                new OA\Property(property: 'user', ref: new Model(type: User::class, groups: ['user:read']), description: 'Updated user information'),
            ], type: 'object')
        )
    )]
    #[OA\Response(
        response: Response::HTTP_BAD_REQUEST,
        description: 'Returns a message indicating the user has not been updated.',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'message', description: 'A message indicating the user has not been updated.', type: 'string'),
            ], type: 'object')
        )
    )]
    #[OA\Response(
        response: Response::HTTP_UNAUTHORIZED,
        description: 'Returns a message indicating the user has not been updated.',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'message', description: 'A message indicating the user has not been updated.', type: 'string'),
            ], type: 'object')
        )
    )]
    #[Route(path: '/me', name: 'put_me', methods: ['PUT'])]
    public function putMe(Request $request, #[CurrentUser] ?User $user): Response
    {
        $form = $this->createForm(UserFormType::class, $user);
        $form->submit($request->getPayload()->all(), false);
        if ($form->isSubmitted() && $form->isValid()) {
            $this->userRepository->updateUser($user);

            return $this->createUserResponse(['message' => $this->translator->trans('updated.user'), 'user' => $user]);
        }

        throw $this->createBadRequestException($this->translator->trans('invalid.user', domain: 'errors'));
    }

    /**
     * Updates the locale of the user.
     *
     * @param Request $request the request object containing the payload data
     * @param User    $user    the current user, if authenticated, or null if not authenticated
     *
     * @return JsonResponse the JSON response object with a message indicating whether the locale has been updated or
     *                      not
     */
    #[OA\RequestBody(content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(properties: [
            new OA\Property(property: 'locale', description: 'The locale of the user.', type: 'string'),
        ], type: 'object')
    ))]
    #[OA\Response(response: Response::HTTP_OK, description: 'Returns a message indicating the locale has been updated.', content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(properties: [
            new OA\Property(property: 'message', description: 'A message indicating the locale has been updated.', type: 'string'),
            new OA\Property(property: 'user', ref: new Model(type: User::class, groups: ['user:read']), description: 'Updated user information'),
        ], type: 'object')
    ))]
    #[Route(path: '/me/locale', name: 'patch_locale', methods: ['PATCH'])]
    public function patchLocale(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $locale = $request->getPayload()->get('locale');

        $user->setLocale($locale);
        $this->userRepository->updateUser($user);

        return $this->createUserResponse(['message' => $this->translator->trans('updated.user_locale', locale: $locale), 'user' => $user]);
    }

    /**
     * Updates the user's email.
     *
     * Changes the email of a user. The new email and the current password must be provided in the request payload.
     * If the password is not valid for the user, a JSON response with an "Unauthorized" status code and a message
     * indicating that the password is not valid is returned. If the password is valid, the user's email is updated,
     * and a JSON response with an "OK" status code, a message, and the user data is returned.
     *
     * @param Request $request the request object containing the payload with the new email and password
     * @param User    $user    The user whose email is to be updated. If null, the authenticated user will be
     *                         considered.
     *
     * @return Response the JSON response containing the result of the operation
     */
    #[OA\RequestBody(content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(properties: [
            new OA\Property(property: 'email', description: 'The new email of the user.', type: 'string', format: 'email'),
            new OA\Property(property: 'password', description: 'The current password of the user.', type: 'string', format: 'password'),
        ], type: 'object')
    ))]
    #[OA\Response(response: Response::HTTP_OK, description: 'Returns a message indicating the email has been updated.', content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(properties: [
            new OA\Property(property: 'message', description: 'A message indicating the email has been updated.', type: 'string'),
            new OA\Property(property: 'user', ref: new Model(type: User::class, groups: ['user:read']), description: 'Updated user information'),
        ], type: 'object')
    ))]
    #[OA\Response(response: Response::HTTP_UNAUTHORIZED, description: 'Returns a message indicating the email has not been updated.', content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(properties: [
            new OA\Property(property: 'message', description: 'A message indicating the email has not been updated.', type: 'string'),
        ], type: 'object')
    ))]
    #[Route(path: '/me/email', name: 'email', methods: ['PATCH'])]
    public function email(Request $request, #[CurrentUser] User $user): Response
    {
        $email = $request->getPayload()->get('email');
        $password = $request->getPayload()->get('password');

        if (!$this->userRepository->isPasswordValid($user, $password)) {
            throw $this->createUnauthorizedException($this->translator->trans('invalid.current_password', domain: 'validators'));
        }

        $user->setEmail($email);

        $this->userRepository->updateUser($user);

        return $this->createUserResponse(['message' => $this->translator->trans('updated.user_email'), 'user' => $user]);
    }

    /**
     * Deletes a user.
     *
     * Deletes a user from the application. The user is identified by the password provided in the request payload.
     * If the password is not valid for the user, a JSON response with an "Unauthorized" status code and a message
     * indicating that the password is not valid is returned. If the password is valid, the user is deleted from the
     *  application, and a JSON response with an "OK" status code and a message indicating that the user has been
     *  deleted is returned.
     *
     * @param Request $request the request object containing the payload with the password
     * @param User    $user    The user to delete it. If null, the authenticated user will be deleted.
     *
     * @return Response the JSON response containing the result of the operation
     */
    #[OA\RequestBody(content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(properties: [
            new OA\Property(property: 'password', description: '', type: 'string'),
        ], type: 'object'),
    ))]
    #[OA\Response(response: Response::HTTP_OK, description: 'Returns a message indicating the user has been deleted.', content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(properties: [
            new OA\Property(property: 'message', description: 'A message indicating the user has been deleted.', type: 'string'),
        ], type: 'object')
    ))]
    #[OA\Response(response: Response::HTTP_UNAUTHORIZED, description: 'Returns a message indicating the user has not been updated.', content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(properties: [
            new OA\Property(property: 'message', description: 'A message indicating the user has not been updated.', type: 'string'),
        ], type: 'object')
    ))]
    #[Route(path: '/me', name: 'deletes', methods: ['DELETE'])]
    public function deletes(Request $request, #[CurrentUser] User $user): Response
    {
        $password = $request->getPayload()->get('password');

        if (!$this->userRepository->isPasswordValid($user, $password)) {
            throw $this->createUnauthorizedException($this->translator->trans('invalid.current_password', domain: 'validators'));
        }

        $result = $this->accountDeletionService->deleteAccount($user);

        return $this->createUserResponse(['message' => $this->translator->trans('deleted.user'), 'result' => $result]);
    }

    /**
     * Change the password of a user.
     *
     * @param Request $request the request object containing the payload data
     * @param User    $user    the current user, if authenticated, or null if not authenticated
     *
     * @return Response the JSON response object with a message indicating whether the password has been updated or not
     */
    #[OA\RequestBody(content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(
            properties: [
                new OA\Property(property: 'currentPassword', description: 'The current password of the user.', type: 'string'),
                new OA\Property(property: 'plainPassword', description: 'The new password of the user.', properties: [
                    new OA\Property(property: 'first', description: 'The new password of the user.', type: 'string'),
                    new OA\Property(property: 'second', description: 'The new password confirmation of the user.', type: 'string'),
                ], type: 'object'),
            ],
            type: 'object'
        )
    ))]
    #[OA\Response(response: Response::HTTP_OK, description: 'Returns a message indicating whether the password has been updated or not.', content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(properties: [
            new OA\Property(property: 'message', description: 'A message indicating whether the password has been updated or not.', type: 'string'),
        ], type: 'object')
    ))]
    #[OA\Response(response: Response::HTTP_BAD_REQUEST, description: 'Returns a message indicating the password has not been updated.', content: new OA\MediaType(
        mediaType: 'application/json',
        schema: new OA\Schema(properties: [
            new OA\Property(property: 'message', description: 'A message indicating the password has not been updated.', type: 'string'),
        ], type: 'object')
    ))]
    #[Route(path: '/me/change-password', name: 'change_password', methods: ['PUT'])]
    public function changePassword(Request $request, #[CurrentUser] User $user): Response
    {
        $form = $this->createForm(ChangePasswordFormType::class, $user);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $this->userRepository->updatePassword($user);

            return $this->createUserResponse(['message' => $this->translator->trans('updated.user_password'), 'user' => $user]);
        }

        throw $this->createBadRequestException($this->translator->trans('invalid.user_password', domain: 'errors'));
    }

    /**
     * Upload user profile picture.
     *
     * @param Request $request the request object containing the payload data
     * @param User    $user    the current user, if authenticated, or null if not authenticated
     *
     * @return Response the JSON response object with a message indicating whether the password has been updated or not
     */
    #[OA\RequestBody(content: new OA\MediaType(
        mediaType: 'multipart/form-data',
        schema: new OA\Schema(
            properties: [
                new OA\Property(property: 'imageFile', description: 'The profile picture of the user.', type: 'string', format: 'binary'),
            ],
            type: 'object'
        )
    ))]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a message indicating whether the profile picture has been updated or not.',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'message', description: 'A message indicating whether the profile picture has been updated or not.', type: 'string'),
                new OA\Property(property: 'user', ref: new Model(type: User::class, groups: ['user:read']), description: 'Updated user information'),
            ], type: 'object')
        )
    )]
    #[OA\Response(
        response: Response::HTTP_BAD_REQUEST,
        description: 'Returns a message indicating the profile picture has not been updated.',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'message', description: 'A message indicating the profile picture has not been updated.', type: 'string'),
            ], type: 'object')
        )
    )]
    #[Route(path: '/me/images', name: 'images', methods: ['POST'])]
    public function images(Request $request, #[CurrentUser] User $user): Response
    {
        $form = $this->createForm(ImageProfileFormType::class, $user);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $this->userRepository->updateUser($user);

            return $this->createUserResponse(['message' => $this->translator->trans('updated.user_picture'), 'user' => $user]);
        }

        throw $this->createBadRequestException($this->translator->trans('invalid.user_picture', domain: 'errors'));
    }

    /**
     * Get the current workspace of the authenticated user.
     *
     * @return JsonResponse
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns the current workspace of the authenticated user.',
        content: new OA\JsonContent(ref: new Model(type: WorkspaceDTO::class))
    )]
    #[Route(path: '/me/current-workspace', name: 'current_workspace', methods: ['GET'])]
    public function currentWorkspace(): JsonResponse
    {
        $user = $this->getUser();
        $workspace = $user->getCurrentWorkspace();
        if (null === $workspaceUser = $this->workspaceUserRepository->findOneBy(['workspace' => $workspace, 'user' => $user])) {
            return $this->json([], Response::HTTP_NO_CONTENT);
        }
        $dto = $this->workspaceDTOFactory->create($workspace, $workspaceUser);
        return $this->json($dto);
    }

    /**
     * Get the workspaces of the authenticated user.
     *
     * @param string $workspacePublicId
     *
     * @return JsonResponse
     */
    #[Route(path: '/me/workspaces/{workspacePublicId}', name: 'switch_workspaces', methods: ['PATCH'])]
    public function switchWorkspaces(string $workspacePublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($workspacePublicId);
        $user = $this->getUser();
        $user->setCurrentWorkspace($workspace);

        $this->workspaceUserRepository->update($user);

        if (null === $workspaceUser = $this->workspaceUserRepository->findOneBy(['workspace' => $workspace, 'user' => $user])) {
            return $this->json([], Response::HTTP_NO_CONTENT);
        }

        $dto = $this->workspaceDTOFactory->create($workspace, $workspaceUser);
        return $this->json([
            'message' => 'Workspace switched',
            'workspace' => $dto
        ]);
    }

    /**
     * Get the workspaces of the authenticated user.
     *
     * @return JsonResponse
     */
    #[Route(path: '/me/workspaces', name: 'workspaces', methods: ['GET'])]
    public function workspaces(): JsonResponse
    {
        $workspaces = $this->workspaceUserRepository->findByUser($this->getUser());

        return $this->json(array_map(fn($workspace) => $this->workspaceDTOFactory->create($workspace->getWorkspace(), $workspace), $workspaces));
    }
}
