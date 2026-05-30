<?php

declare(strict_types=1);

namespace App\ApiController\User;

use App\ApiController\Trait\ApiResponseTrait;
use App\DTO\UserDTO;
use App\Entity\User;
use App\Service\User\UserAvatarService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Vich\UploaderBundle\Templating\Helper\UploaderHelper;

/**
 * Avatar lifecycle for the logged-in user. Multipart upload only — the
 * existing JSON profile update (UserController::updateProfile) intentionally
 * doesn't carry the image so we never need to parse mixed-content payloads.
 */
#[Route('/users/me/avatar')]
class UserAvatarController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'users_me_avatar_upload', methods: ['POST'])]
    public function upload(
        #[CurrentUser] User $user,
        Request $request,
        UserAvatarService $avatarService,
        UploaderHelper $uploaderHelper,
    ): JsonResponse {
        $file = $request->files->get('file');
        if ($file === null) {
            return $this->jsonError('No file uploaded (expected multipart field "file").');
        }

        try {
            $avatarService->upload($user, $file);
        } catch (\InvalidArgumentException $e) {
            return $this->jsonError($e->getMessage(), 400);
        }

        return $this->jsonSuccess(
            UserDTO::fromEntity($user, $uploaderHelper->asset($user, 'imageFile'))->toArray(),
        );
    }

    #[Route('', name: 'users_me_avatar_delete', methods: ['DELETE'])]
    public function delete(
        #[CurrentUser] User $user,
        UserAvatarService $avatarService,
        UploaderHelper $uploaderHelper,
    ): JsonResponse {
        $avatarService->remove($user);

        return $this->jsonSuccess(
            UserDTO::fromEntity($user, $uploaderHelper->asset($user, 'imageFile'))->toArray(),
        );
    }
}
