<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\Employee;
use App\Entity\EvaluationCriteria;
use App\Entity\EvaluationTemplate;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EvaluationTemplateFormType.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class EvaluationTemplateFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'required' => true,
                'documentation' => [
                    'type' => 'string',
                    'description' => 'The name of the evaluation template.',
                ],
            ])
            ->add('description', TextType::class, [
                'required' => false,
                'documentation' => [
                    'type' => 'string',
                    'description' => 'A description of the evaluation template.',
                ],
            ])
            ->add('criterias', null, [
                'class' => EvaluationCriteria::class,
                'choice_label' => 'id',
                'multiple' => true,
                'mapped' => false,
                'documentation' => [
                    'type' => 'array',
                    'description' => 'List of evaluation criteria IDs associated with this template.',
                    'items' => [
                        'type' => 'integer',
                        'example' => 1,
                    ],
                ],
            ])
            ->add('employees', EntityType::class, [
                'class' => Employee::class,
                'choice_label' => 'id',
                'multiple' => true,
                'documentation' => [
                    'type' => 'array',
                    'description' => 'List of employee IDs associated with this evaluation template.',
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
            'data_class' => EvaluationTemplate::class,
            'csrf_protection' => false,
        ]);
    }

    public function getBlockPrefix(): string
    {
        return '';
    }
}
