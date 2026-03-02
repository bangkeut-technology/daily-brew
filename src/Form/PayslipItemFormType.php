<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\PayslipItem;
use App\Enum\PayslipItemTypeEnum;
use Symfony\Component\Form\Extension\Core\Type\EnumType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class PayslipItemFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class PayslipItemFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('type', EnumType::class, [
                'class' => PayslipItemTypeEnum::class,
                'required' => true,
                'documentation' => [
                    'description' => 'Item type: bonus, allowance, or deduction',
                    'type' => 'string',
                    'enum' => ['bonus', 'allowance', 'deduction'],
                ],
            ])
            ->add('label', TextType::class, [
                'required' => true,
                'documentation' => [
                    'description' => 'Description of the item',
                    'type' => 'string',
                    'example' => 'Performance bonus',
                ],
            ])
            ->add('amount', NumberType::class, [
                'required' => true,
                'scale' => 2,
                'documentation' => [
                    'description' => 'Amount of the item',
                    'type' => 'number',
                    'example' => 200.00,
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => PayslipItem::class,
            'csrf_protection' => false,
        ]);
    }
}
