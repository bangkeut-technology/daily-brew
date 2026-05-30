<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Image;

use App\Service\Image\AvatarImageProcessor;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class AvatarImageProcessorTest extends TestCase
{
    private AvatarImageProcessor $processor;
    /** @var list<string> */
    private array $tmpFiles = [];

    protected function setUp(): void
    {
        $this->processor = new AvatarImageProcessor();
    }

    protected function tearDown(): void
    {
        foreach ($this->tmpFiles as $path) {
            if (is_file($path)) {
                @unlink($path);
            }
        }
        $this->tmpFiles = [];
    }

    public function testRejectsNonImageMime(): void
    {
        $path = $this->writeTmp('hello world', '.jpg');
        $file = new UploadedFile($path, 'fake.jpg', 'image/jpeg', test: true);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('JPEG, PNG or WebP');
        $this->processor->process($file);
    }

    public function testRejectsOversizedFile(): void
    {
        // 5.5 MB of bytes — just a buffer, the size check fires before MIME
        // sniffing so the content doesn't have to be a valid image.
        $path = $this->writeTmp(str_repeat('x', 5_500_000), '.jpg');
        $file = new UploadedFile($path, 'big.jpg', 'image/jpeg', test: true);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('5 MB');
        $this->processor->process($file);
    }

    public function testProcessesLandscapeJpegToSquare(): void
    {
        $path = $this->createImage(800, 400, IMAGETYPE_JPEG);
        $file = new UploadedFile($path, 'landscape.jpg', 'image/jpeg', test: true);

        $processed = $this->processor->process($file);
        $info = getimagesize($processed->getPathname());

        $this->assertSame(AvatarImageProcessor::OUTPUT_SIZE, $info[0], 'width should equal target');
        $this->assertSame(AvatarImageProcessor::OUTPUT_SIZE, $info[1], 'height should equal target');
        $this->assertSame(IMAGETYPE_JPEG, $info[2], 'output should be JPEG');
        $this->assertSame('image/jpeg', $processed->getClientMimeType());
        $this->assertStringEndsWith('.jpg', $processed->getClientOriginalName());
    }

    public function testProcessesPortraitPngToSquareJpeg(): void
    {
        $path = $this->createImage(300, 700, IMAGETYPE_PNG);
        $file = new UploadedFile($path, 'tall.png', 'image/png', test: true);

        $processed = $this->processor->process($file);
        $info = getimagesize($processed->getPathname());

        $this->assertSame(AvatarImageProcessor::OUTPUT_SIZE, $info[0]);
        $this->assertSame(AvatarImageProcessor::OUTPUT_SIZE, $info[1]);
        $this->assertSame(IMAGETYPE_JPEG, $info[2], 'PNG must be re-encoded as JPEG');
    }

    public function testProcessesAlreadySquareImage(): void
    {
        $path = $this->createImage(1024, 1024, IMAGETYPE_JPEG);
        $file = new UploadedFile($path, 'square.jpg', 'image/jpeg', test: true);

        $processed = $this->processor->process($file);
        $info = getimagesize($processed->getPathname());

        $this->assertSame(AvatarImageProcessor::OUTPUT_SIZE, $info[0]);
        $this->assertSame(AvatarImageProcessor::OUTPUT_SIZE, $info[1]);
    }

    private function writeTmp(string $content, string $extension): string
    {
        $path = tempnam(sys_get_temp_dir(), 'avatartest_') . $extension;
        file_put_contents($path, $content);
        $this->tmpFiles[] = $path;
        return $path;
    }

    private function createImage(int $width, int $height, int $type): string
    {
        $img = imagecreatetruecolor($width, $height);
        // Fill with a recognizable colour so cover() has something to crop.
        imagefill($img, 0, 0, imagecolorallocate($img, 100, 50, 25));

        $path = tempnam(sys_get_temp_dir(), 'avatarsrc_');
        match ($type) {
            IMAGETYPE_JPEG => imagejpeg($img, $path, 90),
            IMAGETYPE_PNG => imagepng($img, $path),
            default => throw new \RuntimeException('Unsupported test image type'),
        };
        $this->tmpFiles[] = $path;
        return $path;
    }
}
