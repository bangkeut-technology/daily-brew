<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/24/25 1:07PM
 * @see     https://dailybrew.work
 * Copyright (c) 2025 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\Factory\DTO;

use App\DTO\WorkspaceDTO;
use App\Entity\Workspace;
use App\Entity\WorkspaceUser;
use Vich\UploaderBundle\Storage\StorageInterface;

/**
 *
 * Class WorkspaceDTOFactory
 *
 * @package App\Factory\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class WorkspaceDTOFactory
{
    public function __construct(
        private StorageInterface $storage,
    )
    {
    }

    /**
     * Create a WorkspaceDTO from a Workspace entity and a WorkspaceUser entity.
     *
     * @param Workspace     $workspace     The workspace entity.
     * @param WorkspaceUser $workspaceUser The workspace user entity.
     *
     * @return WorkspaceDTO The created WorkspaceDTO.
     */
    public function create(Workspace $workspace, WorkspaceUser $workspaceUser): WorkspaceDTO
    {
        return new WorkspaceDTO(
            publicId: $workspace->publicId,
            name: $workspace->getName(),
            customName: $workspaceUser->getCustomName(),
            logoUrl: $this->storage->resolveUri($workspace, 'imageFile'),
            role: $workspaceUser->getRole(),
        );
    }
}
