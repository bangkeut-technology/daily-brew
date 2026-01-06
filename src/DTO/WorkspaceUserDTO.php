<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/9/25 7:16PM
 * @see     https://adora.media
 * Copyright (c) 2025 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\DTO;

use App\Enum\WorkspaceRoleEnum;

/**
 *
 * Class WorkspaceUserDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class WorkspaceUserDTO
{
    public function __construct(
        public string $publicId,
        public string $email,
        public string $fullName,
        public WorkspaceRoleEnum $role,
    )
    {
    }
}
