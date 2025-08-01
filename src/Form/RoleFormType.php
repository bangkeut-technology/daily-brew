<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\Role;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Class RoleFormType.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class RoleFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The name of the role, e.g., ROLE_ADMIN',
                ],
                'required' => true,
                'constraints' => [
                    new NotBlank(message: 'Please enter a role name'),
                ]
            ])
            ->add('description', TextareaType::class, [
                'required' => false,
                'documentation' => [
                    'type' => 'string',
                    'description' => 'A brief description of the role',
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Role::class,
            'csrf_protection' => false,
        ]);
    }

    public function getBlockPrefix(): string
    {
        return '';
    }
}
