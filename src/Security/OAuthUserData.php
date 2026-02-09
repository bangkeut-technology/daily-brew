<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 2/5/26 9:08PM
 * @see     https://adora.media
 * Copyright (c) 2026 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\Security;

use App\Enum\OAuthProviderEnum;

/**
 *
 * Class OAuthUserData
 *
 * @package App\Security
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class OAuthUserData
{
    public function __construct(
        public OAuthProviderEnum $provider,
        public string            $providerId,
        public string            $email,
        public ?string           $firstName = null,
        public ?string           $lastName = null,
    )
    {
    }
}
