<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\User;
use App\Util\CanonicalFieldsUpdater;
use App\Util\TokenGenerator;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Random\RandomException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class UserRepository.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<User>
 *
 * @method User      create()
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends AbstractRepository implements PasswordUpgraderInterface
{
    /**
     * UserRepository constructor.
     */
    public function __construct(
        ManagerRegistry $registry,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly CanonicalFieldsUpdater $canonicalFieldsUpdater,
    ) {
        parent::__construct($registry, User::class);
    }

    public function findUserBy(array $criteria): ?User
    {
        return $this->findOneBy($criteria);
    }

    public function loadUserByIdentifier(string $secret): ?User
    {
        return $this->findByIdentifier($secret);
    }

    public function findByIdentifier(string $email): ?User
    {
        return $this->findByEmail($email);
    }

    /**
     * Finds a user in the database by their email.
     *
     * This method queries the database for a user with the given email. The email is first passed
     * through the `canonicalizeEmail` method of the `canonicalFieldsUpdater` service to ensure consistency.
     *
     * @param string $email the email of the user to find
     *
     * @return User|null the user object if found, or `null` if not found
     */
    public function findByEmail(string $email): ?User
    {
        return $this->findUserBy(['emailCanonical' => $this->canonicalFieldsUpdater->canonicalizeEmail($email)]);
    }

    /**
     * Updates the user's data and optionally flushes changes to the database.
     *
     * This method updates the canonical fields of the user object. It checks if the user
     * has a plain password and hashes it if necessary. If the user has a null secret, a new
     * secret is generated for the user. The updated user object is then persisted to the database.
     *
     * @param User|UserInterface $user     the user object to be updated
     * @param bool               $andFlush Whether to flush changes to the database. (optional, default: true)
     *
     * @return User the updated user object
     *
     * @throws RandomException
     */
    public function updateUser(User|UserInterface $user, bool $andFlush = true): User
    {
        $this->updateCanonicalFields($user);
        if ($user->getPlainPassword()) {
            $this->hashPassword($user);
        }

        if (null === $user->getSecret()) {
            $string = TokenGenerator::getString(symbols: false);
            do {
                $secret = TokenGenerator::generateFromString($string, 128);
            } while ($this->isSecretExists($secret));
            $user->setSecret($secret);
        }

        $this->update($user, $andFlush);

        return $user;
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', get_class($user)));
        }

        $user->setPassword($newHashedPassword);

        $this->update($user);
    }

    /**
     * @throws RandomException
     */
    public function updatePassword(User $user, bool $andFlush = true): void
    {
        $this->updateUser($user, $andFlush);
    }

    public function updateCanonicalFields(User $user): void
    {
        $this->canonicalFieldsUpdater->updateCanonicalFields($user);
    }

    /**
     * Hash user password.
     */
    private function hashPassword(User $user): void
    {
        $user->setPassword($this->passwordHasher->hashPassword($user, $user->getPlainPassword()));
        $user->eraseCredentials();
    }

    /**
     * Determines if the provided password is valid for the given user.
     *
     * This method checks if the provided user object is not null. If it is null, the method
     * returns false. Otherwise, it uses the passwordHasher service to check if the provided
     * password is valid for the user. The result is then returned as a boolean value.
     *
     * @param User|null $user     the user object to check the password against
     * @param string    $password the password to validate
     *
     * @return bool true if the password is valid for the user, false otherwise
     */
    public function isPasswordValid(?User $user, string $password): bool
    {
        if (!$user) {
            return false;
        }

        return $this->passwordHasher->isPasswordValid($user, $password);
    }

    /**
     * Find a user by his/her id.
     */
    public function findById(int $id): ?User
    {
        return $this->find($id);
    }

    /**
     * Checks if the user secret exists.
     *
     * @param string $secret the identifier
     *
     * @return bool returns the generated identifier
     */
    public function isSecretExists(string $secret): bool
    {
        return $this->createQueryBuilder('u')
                ->select('COUNT(1)')
                ->where('u.secret = :secret')
                ->setParameter('secret', $secret)
                ->getQuery()
                ->getSingleScalarResult() > 0;
    }
}
