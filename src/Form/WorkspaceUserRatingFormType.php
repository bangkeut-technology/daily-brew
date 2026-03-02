<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\WorkspaceUserRating;
use App\Form\Type\DateTimeImmutableType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Range;

/**
 * Class WorkspaceUserRatingFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class WorkspaceUserRatingFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('score', IntegerType::class, [
                'required' => true,
                'constraints' => [
                    new Range(min: 1, max: 5),
                ],
                'documentation' => [
                    'description' => 'Rating score from 1 (lowest) to 5 (highest)',
                    'type' => 'integer',
                    'minimum' => 1,
                    'maximum' => 5,
                    'example' => 4,
                ],
            ])
            ->add('comment', TextType::class, [
                'required' => false,
                'documentation' => [
                    'description' => 'Optional comment for the rating',
                    'type' => 'string',
                    'example' => 'Great team player.',
                ],
            ])
            ->add('period', DateTimeImmutableType::class, [
                'required' => false,
                'documentation' => [
                    'description' => 'Optional period this rating applies to (null = general)',
                    'type' => 'string',
                    'format' => 'date',
                    'example' => '2024-01-01',
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => WorkspaceUserRating::class,
            'csrf_protection' => false,
        ]);
    }
}
