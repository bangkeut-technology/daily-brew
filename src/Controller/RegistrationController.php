<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Event\User\UserRegisteredEvent;
use App\Form\RegistrationFormType;
use App\Repository\UserRepository;
use Exception;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class RegistrationController.
 *
 * @author Vandeth THO <thovandeth@gmail.com>
 */
class RegistrationController extends AbstractController
{
    public function __construct(
        TranslatorInterface              $translator,
        private readonly EventDispatcher $dispatcher,
    ){
        parent::__construct($translator);
    }

    /**
     * Registers a new user.
     *
     * @param Request        $request        the HTTP request object
     * @param Security       $security       the security service
     * @param UserRepository $userRepository the user repository
     *
     * @return Response the HTTP response object
     *
     * @throws Exception if an error occurs during registration
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
    #[Route('/console/sign-up', name: 'daily_brew_console_sign_up', methods: ['POST'])]
    public function register(Request $request, Security $security, UserRepository $userRepository): Response
    {
        $user = $userRepository->create();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $content = $request->getPayload()->all();
        $form->submit($content);

        if ($form->isSubmitted() && $form->isValid()) {
            if ($userRepository->findByIdentifier($user->getEmail())) {
                return $this->json(['message' => 'User already exists'], Response::HTTP_CONFLICT);
            }

            $userRepository->updateUser($user);

            $this->dispatcher->dispatch(new UserRegisteredEvent($user));

            $security->login($user, 'json_login', 'console_area');

            return $this->json([
                'message' => 'You are now registered',
                'user' => $user,
            ], Response::HTTP_CREATED, context: ['groups' => 'user:read']);
        }

        return $this->json(['message' => 'Invalid data'], Response::HTTP_BAD_REQUEST);
    }
}
