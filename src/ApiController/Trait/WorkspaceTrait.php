<?php
/**
 * This file is part of the DailyBrew project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 * @created 1/6/26 2:27 PM
 *
 * @see     https://dailybrew.work
 */

namespace App\ApiController\Trait;

use App\Entity\Workspace;
use App\Enum\ApiErrorCodeEnum;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

trait WorkspaceTrait
{
    /**
     * Retrieves a Workspace entity by its public ID, ensuring it belongs to the authenticated user.
     *
     * @param string $publicId The public identifier of the Workspace.
     *
     * @return Workspace The found Workspace entity.
     *
     * @throws NotFoundHttpException If the Workspace is not found or does not belong to the authenticated user.
     */
    private function getWorkspaceByPublicId(string $publicId): Workspace
    {
        if (null === $workspace = $this->workspaceRepository->findByPublicIdAndUser($publicId, $this->getUser())) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $publicId]);
        }

        return $workspace;
    }
}
