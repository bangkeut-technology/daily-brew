<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use App\Enum\UserRoleEnum;
use App\Repository\UserRepository;

/**
 * Grants ROLE_SUPER_ADMIN to users whose email is in the env-driven
 * `admin_emails` allowlist. Bootstrap-only — does NOT revoke. Once promoted,
 * roles are managed via the admin UI (or by clearing them in the DB).
 *
 * Idempotent — safe to call on every authentication.
 */
class SuperAdminSyncService
{
    /** @var array<int, string> Lowercased emails. */
    private readonly array $allowlist;

    public function __construct(
        string $adminEmails,
        private readonly CanonicalizerService $canonicalizer,
        private readonly UserRepository $userRepository,
    ) {
        $this->allowlist = self::parse($adminEmails, $canonicalizer);
    }

    public function syncFor(User $user): void
    {
        $email = $user->getEmailCanonical();
        if ($email === null) {
            return;
        }

        if (!in_array($email, $this->allowlist, true)) {
            return; // Bootstrap is allowlist-only; revocation lives in the admin UI.
        }

        if ($user->hasRole(UserRoleEnum::SUPER_ADMIN->value)) {
            return;
        }

        $user->setSuperAdmin(true);
        $this->userRepository->update($user);
    }

    /** @return array<int, string> */
    private static function parse(string $raw, CanonicalizerService $canonicalizer): array
    {
        $entries = array_filter(array_map('trim', explode(',', $raw)));
        return array_values(array_map(
            fn (string $email) => $canonicalizer->canonicalizeEmail($email),
            $entries,
        ));
    }
}
