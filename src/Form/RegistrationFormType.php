<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Class RegistrationFormType.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class RegistrationFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class, [
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The email address of the user.',
                ],
                'constraints' => [
                    new NotBlank(message: 'Please enter an email address'),
                    new Email(message: 'Please enter a valid email address'),
                ],
            ])
            ->add('firstName', TextType::class, [
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The first name of the user.',
                ],
            ])
            ->add('lastName', TextType::class, [
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The last name of the user.',
                ],
            ])
            ->add('plainPassword', PasswordType::class, [
                'attr' => ['autocomplete' => 'new-password'],
                'constraints' => [
                    new NotBlank(message: 'Please enter a password'),
                    new Length(
                        min: 6,
                        max: 4096,
                        minMessage: 'Your password should be at least {{ limit }} characters',
                        maxMessage: 'Your password cannot be longer than {{ limit }} characters'
                    ),
                ],
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The password for the user workspace.',
                ],
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
