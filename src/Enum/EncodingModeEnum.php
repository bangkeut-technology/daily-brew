<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 3/27/26 7:12 PM
 *
 * @see     https://adora.media
 */

namespace App\Enum;

/**
 * Class EncodingModeEnum
 *
 * @package App\Enum
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
enum EncodingModeEnum: string
{
    case BASE32 = 'base32';
    case BASE36 = 'base36';
    case BASE64 = 'base64';
    case BASE64URL = 'base64url';
}
