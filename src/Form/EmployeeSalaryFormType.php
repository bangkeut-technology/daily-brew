<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\EmployeeSalary;
use App\Enum\SalaryTypeEnum;
use App\Form\Type\DateTimeImmutableType;
use Symfony\Component\Form\Extension\Core\Type\EnumType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EmployeeSalaryFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class EmployeeSalaryFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('baseSalary', NumberType::class, [
                'required' => true,
                'scale' => 2,
                'documentation' => [
                    'description' => 'Base salary amount',
                    'type' => 'number',
                    'example' => 1500.00,
                ],
            ])
            ->add('currency', TextType::class, [
                'required' => false,
                'documentation' => [
                    'description' => 'ISO 4217 currency code (default: USD)',
                    'type' => 'string',
                    'example' => 'USD',
                ],
            ])
            ->add('salaryType', EnumType::class, [
                'class' => SalaryTypeEnum::class,
                'required' => false,
                'documentation' => [
                    'description' => 'Salary type: monthly, daily, or hourly',
                    'type' => 'string',
                    'enum' => ['monthly', 'daily', 'hourly'],
                ],
            ])
            ->add('effectiveFrom', DateTimeImmutableType::class, [
                'required' => true,
                'documentation' => [
                    'description' => 'Date from which this salary is effective',
                    'type' => 'string',
                    'format' => 'date',
                    'example' => '2024-01-01',
                ],
            ])
            ->add('effectiveTo', DateTimeImmutableType::class, [
                'required' => false,
                'documentation' => [
                    'description' => 'Date until which this salary is effective (null = ongoing)',
                    'type' => 'string',
                    'format' => 'date',
                    'example' => '2024-12-31',
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => EmployeeSalary::class,
            'csrf_protection' => false,
        ]);
    }
}
