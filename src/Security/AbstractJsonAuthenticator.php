<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\Role\RoleHierarchyInterface;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Vich\UploaderBundle\Templating\Helper\UploaderHelper;

/**
 * Class AbstractJsonAuthenticator.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
abstract class AbstractJsonAuthenticator extends AbstractAuthenticator
{
    /**
     * JsonAuthenticator constructor.
     *
     * @param UserRepository         $userRepository User repository
     * @param UploaderHelper         $uploaderHelper Uploader helper
     * @param RoleHierarchyInterface $roleHierarchy  Role hierarchy
     */
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly UploaderHelper $uploaderHelper,
        private readonly RoleHierarchyInterface $roleHierarchy,
    ) {
    }

    /**
     * Called on every request to decide if this authenticator should be
     * used for the request. Returning `false` will cause this authenticator
     * to be skipped.
     */
    public function supports(Request $request): ?bool
    {
        return 'daily_brew_security_login' === $request->attributes->get('_route') && $request->isMethod('POST');
    }

    /**
     * @throws \JsonException
     */
    private function getCredentials(Request $request)
    {
        return json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
    }

    /**
     * @throws \JsonException
     */
    public function authenticate(Request $request): Passport
    {
        $credentials = $this->getCredentials($request);

        return new Passport(
            new UserBadge($credentials['email'], function ($credential) {
                if (null === $user = $this->userRepository->findByIdentifier($credential)) {
                    throw new CustomUserMessageAuthenticationException('User not found');
                }

                if ($user->isEnabled()) {
                    return $user;
                }

                throw new CustomUserMessageAuthenticationException('Your account has been disabled');
            }),
            new PasswordCredentials($credentials['password']),
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        /** @var User $user */
        $user = $token->getUser();
        $roles = $this->roleHierarchy->getReachableRoleNames($user->getRoles());

        return new JsonResponse([
            'message' => 'Authentication successful',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'emailCanonical' => $user->getEmailCanonical(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'dob' => $user->getDob()?->format('Y-m-d'),
                'roles' => $roles,
                'locale' => $user->getLocale() ?? 'en',
                'avatarUrl' => $this->uploaderHelper->asset($user, 'imageFile'),
            ],
        ]);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $data = [
            'message' => strtr($exception->getMessageKey(), $exception->getMessageData()),
        ];

        return new JsonResponse($data, Response::HTTP_UNAUTHORIZED);
    }
}
