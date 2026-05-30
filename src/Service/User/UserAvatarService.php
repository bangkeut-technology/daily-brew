<?php

declare(strict_types=1);

namespace App\Service\User;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\Image\AvatarImageProcessor;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Owns the avatar lifecycle for a single User. All file-on-disk work happens
 * through Vich (configured in vich_uploader.yaml under the "users" mapping) —
 * setting the imageFile triggers the upload listener on flush, and clearing
 * it triggers the delete listener.
 */
final class UserAvatarService
{
    public function __construct(
        private readonly AvatarImageProcessor $processor,
        private readonly UserRepository $userRepository,
    ) {}

    /**
     * Replaces the user's avatar with the processed (square 512×512 JPEG)
     * version of $file. If they already had one, Vich's delete-on-update
     * listener removes the previous file from disk.
     *
     * @throws \InvalidArgumentException when the upload fails validation
     *         (see {@see AvatarImageProcessor}).
     */
    public function upload(User $user, UploadedFile $file): void
    {
        $processed = $this->processor->process($file);
        $user->setImageFile($processed);
        $this->userRepository->flush();
    }

    /**
     * Drops the avatar. Vich's delete-on-remove listener clears the file from
     * disk once we null out imageFile and persist a null imageName.
     */
    public function remove(User $user): void
    {
        if ($user->getImageName() === null) {
            return;
        }

        $user->setImageFile(null);
        $user->setImageName(null);
        $user->setFileSize(null);
        $user->setOriginalName(null);
        $user->setMimeType(null);
        $user->setDimensions(null);
        $this->userRepository->flush();
    }
}
