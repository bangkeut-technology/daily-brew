<?php
/**
 * This file is part of the DailyBrew project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/9/25 7:16PM
 * @see     https://dailybrew.work
 * Copyright (c) 2025 DailyBrew. All rights reserved.
 */
declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\WorkspaceUser;
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
    use HasEntityMapper;

    public function __construct(
        public string            $publicId,
        public string            $email,
        public string            $fullName,
        public WorkspaceRoleEnum $role,
        public ?EmployeeDTO      $employee = null,
    )
    {
    }

    public static function fromEntity(WorkspaceUser $member): self
    {
        $user = $member->getUser();

        return new self(
            publicId: $member->publicId,
            email: $user->getEmail(),
            fullName: $user->getFullName(),
            role: $member->getRole(),
            employee: $member->getEmployee() !== null
                ? EmployeeDTO::fromEntity($member->getEmployee())
                : null,
        );
    }
}
