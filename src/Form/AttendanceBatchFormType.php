<?php
declare(strict_types=1);


namespace App\Form;

use App\Entity\AttendanceBatch;
use App\Entity\Employee;
use App\Enum\AttendanceTypeEnum;
use App\Form\Type\DateTimeImmutableType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\EnumType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class AttendanceBatchFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class AttendanceBatchFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('type', EnumType::class, [
                'class' => AttendanceTypeEnum::class,
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The type of attendance batch.',
                    'enum' => AttendanceTypeEnum::class,
                ]
            ])
            ->add('label', TextType::class, [
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The label of the attendance batch.',
                    'example' => 'Weekly Attendance',
                    'required' => true,
                ]
            ])
            ->add('note', TextType::class, [
                'required' => false,
                'documentation' => [
                    'type' => 'string',
                    'description' => 'A note for the attendance batch.',
                    'example' => 'Weekly attendance for the week of 2020-01-01 to 2020-01-07.',
                ]
            ])
            ->add('fromDate', DateTimeImmutableType::class, [
                'documentation' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => 'The start date of the attendance batch.',
                    'example' => '2020-01-01T00:00:00Z',
                ]
            ])
            ->add('toDate', DateTimeImmutableType::class, [
                'documentation' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => 'The end date of the attendance batch.',
                    'example' => '2020-01-07T00:00:00Z',
                ]
            ])
            ->add('employees', EntityType::class, [
                'class' => Employee::class,
                'mapped' => false,
                'multiple' => true,
                'documentation' => [
                    'type' => 'array',
                    'description' => 'List of employee IDs associated with this attendance batch.',
                    'items' => [
                        'type' => 'integer',
                        'example' => 1,
                        'required' => true,
                    ]
                ]
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => AttendanceBatch::class,
            'csrf_protection' => false,
        ]);
    }
}
