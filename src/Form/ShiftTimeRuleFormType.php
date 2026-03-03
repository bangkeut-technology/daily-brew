<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\ShiftTimeRule;
use App\Enum\DayOfWeekEnum;
use Symfony\Component\Form\Extension\Core\Type\EnumType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Regex;

/**
 * Class ShiftTimeRuleFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class ShiftTimeRuleFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $timePattern = new Regex([
            'pattern' => '/^\d{2}:\d{2}$/',
            'message' => 'Time must be in HH:MM format.',
        ]);

        $builder
            ->add('dayOfWeek', EnumType::class, [
                'class' => DayOfWeekEnum::class,
                'required' => true,
                'constraints' => [new NotBlank()],
                'documentation' => [
                    'description' => 'ISO day of week (1=Monday … 7=Sunday)',
                    'type' => 'integer',
                    'example' => 1,
                ],
            ])
            ->add('startTime', TextType::class, [
                'required' => true,
                'constraints' => [new NotBlank(), $timePattern],
                'documentation' => [
                    'description' => 'Shift start time in HH:MM format',
                    'type' => 'string',
                    'example' => '07:00',
                ],
            ])
            ->add('endTime', TextType::class, [
                'required' => true,
                'constraints' => [new NotBlank(), $timePattern],
                'documentation' => [
                    'description' => 'Shift end time in HH:MM format',
                    'type' => 'string',
                    'example' => '14:00',
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => ShiftTimeRule::class,
            'csrf_protection' => false,
        ]);
    }
}
