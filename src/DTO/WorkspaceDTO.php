<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/9/25 11:37AM
 * @see     https://adora.media
 * Copyright (c) 2025 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\DTO;

use App\Enum\WorkspaceRoleEnum;

/**
 *
 * Class WorkspaceDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class WorkspaceDTO
{
    public function __construct(
        public string $publicId,
        public string $name,
        public bool $internal = false,
        public ?string $customName = null,
        public ?string $logoUrl = null,
        public ?WorkspaceRoleEnum $role = null,
    )
    {
    }
}
