<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Image;

/**
 * Class ImageProfileFormType.
 *
 * @author Vandeth THO <thovandeth@gmail.com>
 */
class ImageProfileFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('imageFile', FileType::class, [
                'label' => 'Image',
                'required' => true,
                'constraints' => [
                    new Image(
                        maxSize: '5M',
                        mimeTypes: [
                            'image/jpeg',
                            'image/png',
                        ],
                        maxSizeMessage: 'image.max_size',
                        mimeTypesMessage: 'image.mime_type',
                    ),
                ],
                'documentation' => [
                    'type' => 'string',
                    'format' => 'binary',
                    'description' => 'The image file to be uploaded as the user profile picture.',
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'csrf_protection' => false,
        ]);
    }

    public function getBlockPrefix(): string
    {
        return '';
    }
}
