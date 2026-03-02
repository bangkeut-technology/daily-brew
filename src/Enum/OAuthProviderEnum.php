<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 2/5/26 9:09PM
 * @see     https://adora.media
 * Copyright (c) 2026 Adora. All rights reserved.
 */

namespace App\Enum;

enum OAuthProviderEnum: string
{
    case GOOGLE = 'google';
    case APPLE = 'apple';
}
