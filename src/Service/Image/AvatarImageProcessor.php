<?php

declare(strict_types=1);

namespace App\Service\Image;

use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Validates a user-supplied image and rewrites it as a square 512×512 JPEG.
 * Returned UploadedFile is what we hand to Vich's setImageFile() so the bundle
 * stores the processed bytes (not the original upload), keeping disk usage
 * predictable and stripping any embedded payload an attacker might smuggle in.
 *
 * Why JPEG: tiny avatars over the wire, lossless re-encoding wouldn't gain
 * anything at this size, and JPEG handles arbitrary RGB content without alpha
 * concerns. PNGs and WebPs get flattened.
 */
final class AvatarImageProcessor
{
    public const int OUTPUT_SIZE = 512;
    public const int MAX_SIZE_BYTES = 5_242_880; // 5 MB
    public const int JPEG_QUALITY = 85;

    private const array ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    /**
     * @throws InvalidArgumentException when the upload is missing, too large,
     *         or not one of the allowed image MIME types.
     */
    public function process(UploadedFile $file): UploadedFile
    {
        if (!$file->isValid()) {
            throw new InvalidArgumentException('Uploaded file is not valid.');
        }

        if ($file->getSize() > self::MAX_SIZE_BYTES) {
            throw new InvalidArgumentException('Image must be 5 MB or smaller.');
        }

        // getMimeType() reads the file's magic bytes — not the client-supplied
        // header — so a .txt renamed to .jpg gets caught here.
        $mime = $file->getMimeType();
        if (!in_array($mime, self::ALLOWED_MIME_TYPES, true)) {
            throw new InvalidArgumentException('Image must be JPEG, PNG or WebP.');
        }

        try {
            $manager = new ImageManager(new Driver());
            $image = $manager->read($file->getPathname());
            // cover() resizes so the shorter side fills the target and then
            // center-crops the longer side — exactly the avatar behaviour we
            // want regardless of source aspect ratio.
            $image->cover(self::OUTPUT_SIZE, self::OUTPUT_SIZE);
            $encoded = $image->toJpeg(self::JPEG_QUALITY);
        } catch (\Throwable $e) {
            throw new InvalidArgumentException('Could not process the image: ' . $e->getMessage(), previous: $e);
        }

        $tmpPath = tempnam(sys_get_temp_dir(), 'avatar_');
        if ($tmpPath === false) {
            throw new InvalidArgumentException('Could not allocate a temp file for the processed image.');
        }
        file_put_contents($tmpPath, (string) $encoded);

        // test=true keeps the UploadedFile usable outside the HTTP lifecycle —
        // without it the constructor calls is_uploaded_file() and rejects our
        // temp path because it didn't arrive via SAPI.
        return new UploadedFile(
            path: $tmpPath,
            originalName: $this->derivedOriginalName($file),
            mimeType: 'image/jpeg',
            error: null,
            test: true,
        );
    }

    private function derivedOriginalName(UploadedFile $file): string
    {
        $base = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) ?: 'avatar';
        return $base . '.jpg';
    }
}
