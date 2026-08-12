<?php

declare(strict_types=1);

namespace App\Service\Integration;

use App\Entity\ApiToken;
use App\Entity\Workspace;
use App\Enum\ApiTokenScopeEnum;
use App\Repository\ApiTokenRepository;

/**
 * Mints an API token together with its signing secret.
 *
 * Both secrets are returned in plaintext exactly once, here. The token is
 * stored as a digest and the signing secret encrypted, so neither can be
 * recovered afterwards — a lost one is re-minted, not looked up.
 */
final readonly class ApiTokenMinter
{
    /** 32 bytes, the HMAC-SHA256 block-optimal key size. */
    private const int SECRET_BYTES = 32;

    public function __construct(
        private ApiTokenRepository $apiTokenRepository,
        private SecretCipher $cipher,
    ) {
    }

    /**
     * @param  array<int, ApiTokenScopeEnum> $scopes
     * @return array{token: ApiToken, plainToken: string, plainSigningSecret: string}
     */
    public function mint(Workspace $workspace, string $name, array $scopes): array
    {
        ['entity' => $token, 'plainToken' => $plainToken] = ApiToken::create($workspace, $name, $scopes);

        // Every token gets a signing secret, even a read-only one: the cost is
        // 32 bytes, and it means granting write access later doesn't require
        // re-issuing the token to a system that's already integrated.
        $plainSecret = 'dbs_'.bin2hex(random_bytes(self::SECRET_BYTES));
        $token->setSigningSecretEncrypted($this->cipher->encrypt($plainSecret));

        $this->apiTokenRepository->persist($token);
        $this->apiTokenRepository->flush();

        return [
            'token' => $token,
            'plainToken' => $plainToken,
            'plainSigningSecret' => $plainSecret,
        ];
    }
}
