<?php
declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gesdinet\JWTRefreshTokenBundle\Entity\RefreshToken as BaseRefreshToken;

/**
 * Class RefreshToken
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Entity]
#[ORM\Table(name: 'daily_brew_refresh_tokens')]
class RefreshToken extends BaseRefreshToken
{
}
