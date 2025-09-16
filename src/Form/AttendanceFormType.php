<?php
declare(strict_types=1);


namespace App\Form;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Enum\AttendanceTypeEnum;
use App\Form\Type\DateTimeImmutableType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\EnumType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class AttendanceFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class AttendanceFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('attendanceDate', DateTimeImmutableType::class, [
                'documentation' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => 'The date of the attendance in YYYY-MM-DD format.',
                ]])
            ->add('note', TextType::class, [
                'documentation' => [
                    'type' => 'string',
                    'description' => 'A note for the attendance, e.g. "Sick leave" or "Vacation".',
                ]
            ])
            ->add('status', EnumType::class, [
                'class' => AttendanceTypeEnum::class,
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The status of the attendance, e.g. "Present", "Absent", "Late", or "Leave".',
                ]
            ])
            ->add('clockIn', DateTimeImmutableType::class, [
                'documentation' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => 'The time the employee clocked in.',
                ]
            ])
            ->add('clockOut', DateTimeImmutableType::class, [
                'documentation' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => 'The time the employee clocked out.',
                ]
            ])
            ->add('employee', EntityType::class, [
                'class' => Employee::class,
                'choice_label' => 'id',
                'documentation' => [
                    'type' => 'integer',
                    'description' => 'The ID of the employee associated with this attendance record.',
                ]
            ]);
    }

    /**
     * Configures the options for this form type.
     *
     * @param OptionsResolver $resolver The resolver for the options.
     */
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Attendance::class,
            'csrf_protection' => false,
        ]);
    }
}
