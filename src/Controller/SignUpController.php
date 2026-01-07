<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Event\User\UserSignedUpEvent;
use App\Form\SignUpFormType;
use App\Repository\UserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Http\Authentication\AuthenticationSuccessHandler;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Psr\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class SignUpController
 *
 * @package App\Controller
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class SignUpController extends AbstractController
{
    public function __construct(
        TranslatorInterface                       $translator,
        private readonly EventDispatcherInterface $dispatcher,
    )
    {
        parent::__construct($translator);
    }

    /**dw
     * Registers a new user.
     *
     * @param Request                      $request        the HTTP request object
     * @param UserRepository               $userRepository the user repository
     * @param AuthenticationSuccessHandler $authenticationSuccessHandler
     *
     * @return Response the HTTP response object
     *
     */
    #[OA\RequestBody(
        description: 'User registration',
        required: true,
        content: new OA\JsonContent(properties: [
            new OA\Property(property: 'email', description: 'User email', type: 'string', format: 'email'),
            new OA\Property(property: 'plainPassword', description: 'User password', type: 'string', format: 'password'),
            new OA\Property(property: 'firstName', description: 'User first name', type: 'string'),
            new OA\Property(property: 'lastName', description: 'User last name', type: 'string'),
        ])
    )]
    #[OA\Response(
        response: Response::HTTP_CREATED,
        description: 'You are now registered',
        content: new OA\JsonContent(properties: [
            new OA\Property('message', type: 'string'),
            new OA\Property(property: 'user', ref: new Model(type: User::class, groups: ['user:read']), description: 'Updated user information'),
        ])
    )]
    #[OA\Response(
        response: Response::HTTP_CONFLICT,
        description: 'User already exists',
        content: new OA\JsonContent(properties: [
            new OA\Property('message', type: 'string'),
        ])
    )]
    #[OA\Response(
        response: Response::HTTP_BAD_REQUEST,
        description: 'Invalid data',
        content: new OA\JsonContent(properties: [
            new OA\Property('message', type: 'string'),
        ])
    )]
    #[Route('/sign-up', name: 'adora_sign_up', methods: ['POST'], priority: 98)]
    public function signUp(Request $request, UserRepository $userRepository, AuthenticationSuccessHandler $authenticationSuccessHandler): Response
    {
        $user = $userRepository->create();
        $form = $this->createForm(SignUpFormType::class, $user);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            if ($userRepository->findByIdentifier($user->getEmail())) {
                return $this->json(['message' => 'User already exists'], Response::HTTP_CONFLICT);
            }

            $userRepository->updateUser($user);

            $this->dispatcher->dispatch(new UserSignedUpEvent($user));

            return $authenticationSuccessHandler->handleAuthenticationSuccess($user);
        }

        return $this->json(['message' => 'Invalid data'], Response::HTTP_BAD_REQUEST);
    }
}
