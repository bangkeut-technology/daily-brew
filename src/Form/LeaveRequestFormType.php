<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\LeaveRequest;
use App\Enum\LeaveTypeEnum;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\EnumType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Class LeaveRequestFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class LeaveRequestFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('type', EnumType::class, [
                'class'    => LeaveTypeEnum::class,
                'required' => true,
                'constraints' => [new NotBlank()],
                'documentation' => [
                    'description' => 'Leave type: paid or unpaid',
                    'type'        => 'string',
                    'example'     => 'paid',
                ],
            ])
            ->add('startDate', DateTimeType::class, [
                'widget'   => 'single_text',
                'input'    => 'datetime_immutable',
                'required' => true,
                'constraints' => [new NotBlank()],
                'documentation' => [
                    'description' => 'Start date of the leave (ISO 8601)',
                    'type'        => 'string',
                    'example'     => '2026-03-10',
                ],
            ])
            ->add('endDate', DateTimeType::class, [
                'widget'   => 'single_text',
                'input'    => 'datetime_immutable',
                'required' => true,
                'constraints' => [new NotBlank()],
                'documentation' => [
                    'description' => 'End date of the leave (ISO 8601)',
                    'type'        => 'string',
                    'example'     => '2026-03-11',
                ],
            ])
            ->add('reason', TextType::class, [
                'required' => false,
                'documentation' => [
                    'description' => 'Optional reason for the leave request',
                    'type'        => 'string',
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class'      => LeaveRequest::class,
            'csrf_protection' => false,
        ]);
    }
}
