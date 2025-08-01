<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\EvaluationCriteria;
use App\Entity\EvaluationTemplate;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EvaluationCriteriaFormType.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class EvaluationCriteriaFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('label', TextType::class, [
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The label of the evaluation criteria.',
                ],
            ])
            ->add('description', TextType::class, [
                'required' => false,
                'documentation' => [
                    'type' => 'string',
                    'description' => 'A description of the evaluation criteria.',
                ],
            ])
            ->add('weight', NumberType::class, [
                'documentation' => [
                    'type' => 'number',
                    'description' => 'The weight of the evaluation criteria, which determines its importance in the overall evaluation.',
                ],
            ])
            ->add('templates', null, [
                'class' => EvaluationTemplate::class,
                'choice_label' => 'id',
                'multiple' => true,
                'mapped' => false,
                'documentation' => [
                    'type' => 'array',
                    'description' => 'List of evaluation template IDs associated with this criteria.',
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
            'data_class' => EvaluationCriteria::class,
            'csrf_protection' => false,
        ]);
    }

    public function getBlockPrefix(): string
    {
        return '';
    }
}
