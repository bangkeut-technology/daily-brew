<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\Shift;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\PositiveOrZero;

/**
 * Class ShiftFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class ShiftFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'required' => true,
                'constraints' => [new NotBlank()],
                'documentation' => [
                    'description' => 'Shift name (e.g. "Morning", "Fullday Service")',
                    'type' => 'string',
                    'example' => 'Morning',
                ],
            ])
            ->add('graceLateMinutes', IntegerType::class, [
                'required' => false,
                'constraints' => [new PositiveOrZero()],
                'documentation' => [
                    'description' => 'Grace period in minutes before a check-in is marked late',
                    'type' => 'integer',
                    'example' => 5,
                ],
            ])
            ->add('graceEarlyMinutes', IntegerType::class, [
                'required' => false,
                'constraints' => [new PositiveOrZero()],
                'documentation' => [
                    'description' => 'Grace period in minutes before an early check-out is penalised',
                    'type' => 'integer',
                    'example' => 5,
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Shift::class,
            'csrf_protection' => false,
        ]);
    }
}
