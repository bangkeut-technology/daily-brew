<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\User;
use App\Form\Type\DateTimeImmutableType;
use App\Form\Type\ImageType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Class UserFormType.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class UserFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('firstName', TextType::class, [
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The first name of the user.',
                ]
            ])
            ->add('lastName', TextType::class, [
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The last name of the user.',
                ]
            ])
            ->add('plainPassword', PasswordType::class, [
                'attr' => ['autocomplete' => 'new-password'],
                'constraints' => [
                    new NotBlank(
                        message: 'Please enter a password',
                    ),
                    new Length(
                        min: 6,
                        max: 4096,
                        minMessage: 'Password must be at least {{ limit }} characters long',
                        maxMessage: 'Password cannot be longer than {{ limit }} characters',
                    ),
                ],
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The password of the user. Must be at least 6 characters long.',
                ]
            ])->add('dob', DateTimeImmutableType::class, [
                'documentation' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => 'The date of birth in YYYY-MM-DD format.',
                ]
            ])
            ->add('imageFile', ImageType::class, [
                'label' => 'Image',
                'required' => true,
                'documentation' => [
                    'type' => 'string',
                    'format' => 'binary',
                    'description' => 'The image file of the user.',
                ]
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => User::class,
        ]);
    }

    public function getBlockPrefix(): string
    {
        return '';
    }
}
