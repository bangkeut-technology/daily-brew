<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\Employee;
use App\Entity\EvaluationTemplate;
use App\Entity\Role;
use App\Form\Type\DateTimeImmutableType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EmployeeFormType.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class EmployeeFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('firstName', TextType::class, [
                'required' => true,
                'documentation' => [
                    'description' => 'The first name of the employee.',
                    'type' => 'string',
                    'example' => 'John',
                ],
            ])
            ->add('lastName', TextType::class, [
                'required' => true,
                'documentation' => [
                    'description' => 'The last name of the employee.',
                    'type' => 'string',
                    'example' => 'Doe',
                ],
            ])
            ->add('phoneNumber', TextType::class, [
                'required' => false,
                'documentation' => [
                    'description' => 'The phone number of the employee.',
                    'type' => 'string',
                    'example' => '+1234567890',
                ],
            ])
            ->add('dob', DateTimeImmutableType::class, [
                'required' => false,
                'documentation' => [
                    'description' => 'The date of birth of the employee.',
                    'type' => 'string',
                    'format' => 'date-time',
                    'example' => '1990-01-01T00:00:00Z',
                ],
            ])
            ->add('joinedAt', DateTimeImmutableType::class, [
                'required' => false,
                'documentation' => [
                    'description' => 'The date when the employee joined.',
                    'type' => 'string',
                    'format' => 'date-time',
                    'example' => '2020-01-01T00:00:00Z',
                ],
            ])
            ->add('roles', EntityType::class, [
                'class' => Role::class,
                'choice_label' => 'id',
                'multiple' => true,
                'documentation' => [
                    'description' => 'The roles assigned to the employee.',
                    'type' => 'array',
                    'items' => [
                        'type' => 'integer',
                        'example' => 1,
                    ],
                ],
            ])
            ->add('templates', EntityType::class, [
                'class' => EvaluationTemplate::class,
                'choice_label' => 'id',
                'multiple' => true,
                'required' => false,
                'documentation' => [
                    'description' => 'The evaluation templates assigned to the employee.',
                    'type' => 'array',
                    'items' => [
                        'type' => 'integer',
                        'example' => 1,
                    ],
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Employee::class,
            'csrf_protection' => false,
        ]);
    }

    public function getBlockPrefix(): string
    {
        return '';
    }
}
