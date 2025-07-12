<?php
declare(strict_types=1);

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Validator\Constraints\UserPassword;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Class ChangePasswordFormType
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class ChangePasswordFormType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $constraintsOptions = [
            'message' => 'invalid_data.current_password',
        ];

        if (!empty($options['validation_groups'])) {
            $constraintsOptions['groups'] = [reset($options['validation_groups'])];
        }

        $builder->add('current_password', PasswordType::class, [
            'label' => 'Current Password',
            'mapped' => false,
            'constraints' => [
                new NotBlank(),
                new UserPassword($constraintsOptions),
            ],
            'translation_domain' => 'messages',
            'attr' => [
                'autocomplete' => 'current-password',
            ],
        ]);

        $builder->add('plainPassword', RepeatedType::class, [
            'type' => PasswordType::class,
            'options' => [
                'attr' => [
                    'autocomplete' => 'new-password',
                ],
            ],
            'first_options' => ['label' => 'New Password'],
            'second_options' => ['label' => 'New Password Confirmation'],
            'invalid_message' => 'The password fields must match.',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'csrf_protection' => false,
        ]);
    }

    /**
     * @return string
     */
    public function getBlockPrefix(): string
    {
        return '';
    }
}