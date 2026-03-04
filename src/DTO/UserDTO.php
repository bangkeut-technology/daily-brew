<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 1/13/26 12:07 PM
 *
 * @see     https://adora.media
 */

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\User;

/**
 *
 * Class UserDTO
 *
 * @package App\DTO;
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class UserDTO
{
    use HasEntityMapper;

    public function __construct(
        public string  $publicId,
        public string  $email,
        public string  $firstName,
        public string  $lastName,
        public array   $roles,
        public bool    $enabled = false,
        public string  $locale = 'en',
        public ?string $avatarUrl = null,
        public array   $authentications = [
            'password'  => false,
            'google'    => false,
            'apple'     => false,
        ],

    )
    {
    }

    /**
     * Creates a new instance of the class based on the given User entity and additional parameters.
     *
     * @param User        $user      The user entity used to populate the instance.
     * @param array|null  $roles     The roles assigned to the user. Defaults to null.
     * @param string|null $avatarUrl The URL of the user's avatar. Defaults to null.
     *
     * @return self A new instance of the class populated with data from the User entity and additional parameters.
     */
    public static function fromEntity(
        User    $user,
        ?array  $roles = null,
        ?string $avatarUrl = null
    ): self
    {
        return new self(
            publicId: $user->publicId,
            email: $user->getEmail(),
            firstName: $user->getFirstName(),
            lastName: $user->getLastName(),
            roles: $roles ?? $user->getRoles(),
            enabled: $user->isEnabled(),
            locale: $user->getLocale(),
            avatarUrl: $avatarUrl,
            authentications: [
                'password'  => $user->getPassword() !== null,
                'google'    => $user->getGoogleId() !== null,
                'apple'     => $user->getAppleId() !== null,
            ]
        );
    }
}
