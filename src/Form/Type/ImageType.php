<?php

declare(strict_types=1);

namespace App\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Image;

/**
 * Class ImageType.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class ImageType extends AbstractType
{
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'label' => 'Image',
            'required' => true,
            'constraints' => [
                new Image(
                    maxSize: '5M',
                    mimeTypes: [
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                        'image/webp',
                    ],
                    maxSizeMessage: 'image.max_size',
                    mimeTypesMessage: 'image.mime_type',
                ),
            ],
        ]);
    }

    public function getParent(): string
    {
        return FileType::class;
    }
}
