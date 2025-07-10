<?php
declare(strict_types=1);


namespace App\Util;


use App\Entity\User;

/**
 * Class updating the canonical fields of the user.
 *
 * @author Christophe Coevoet <stof@notk.org>
 */
readonly class CanonicalFieldsUpdater
{
    /**
     * CanonicalFieldsUpdater constructor.
     *
     * @param CanonicalizerInterface $emailCanonicalizer
     */
    public function __construct(private CanonicalizerInterface $emailCanonicalizer)
    {
    }

    /**
     * Canonicalizes a email.
     *
     * @param User $user
     */
    public function updateCanonicalFields(User $user): void
    {
        $user->setEmailCanonical($this->canonicalizeEmail($user->getEmail()));
    }

    /**
     * Canonicalizes an email.
     *
     * @param string|null $email
     *
     * @return string|null
     */
    public function canonicalizeEmail(?string $email): ?string
    {
        return $this->emailCanonicalizer->canonicalize($email);
    }
}
