<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\EvaluationCriteria;
use App\Entity\EvaluationTemplate;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EvaluationCriteriaFormType.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class EvaluationCriteriaFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('label')
            ->add('description')
            ->add('weight')
            ->add('templates', null, [
                'class' => EvaluationTemplate::class,
                'choice_label' => 'id',
                'multiple' => true,
                'mapped' => false,
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
