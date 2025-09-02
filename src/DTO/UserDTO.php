<?php
declare(strict_types=1);

namespace App\DTO;

use App\Entity\User;

/**
 * Class UserDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class UserDTO
{
    public function __construct(
        public string $publicId,
        public ?string $email = null,
        public ?string $emailCanonical = null,
        public ?string $firstName = null,
        public ?string $lastName = null,
    )
    {
    }

    /**
     * Creates an instance of the class from a User entity.
     *
     * @param User $user the User entity to transform
     *
     * @return self
     */
    public static function fromEntity(User $user): self
    {
        return new self(
            publicId: $user->getPublicId(),
            email: $user->getEmail(),
            emailCanonical: $user->getEmailCanonical(),
            firstName: $user->getFirstName(),
            lastName: $user->getLastName(),
        );
    }
}
