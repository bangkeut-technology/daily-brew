<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\EmployeeEvaluation;
use App\Entity\EvaluationTemplate;
use App\Entity\User;
use App\Form\Type\DateTimeImmutableType;
use App\Repository\EvaluationTemplateRepository;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EmployeeEvaluationFormType.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class EmployeeEvaluationFormType extends AbstractFormType
{
    /**
     * @var User|null
     */
    private readonly ?User $user;

    public function __construct(
        Security $security,
    ) {
        $this->user = $security->getUser();
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('evaluatedAt', DateTimeImmutableType::class, [
                'documentation' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => 'Date and time of the evaluation',
                ],
            ])
            ->add('note', TextType::class, [
                'documentation' => [
                    'type' => 'string',
                    'description' => 'Notes for the evaluation',
                ],
            ])
            ->add('template', EntityType::class, [
                'class' => EvaluationTemplate::class,
                'query_builder' => function (EvaluationTemplateRepository $repository): QueryBuilder {
                    return $repository->findByUserQueryBuilder($this->user);
                },
                'documentation' => [
                    'type' => 'integer',
                    'description' => 'Evaluation template ID',
                ],
            ])
            ->add('scores', CollectionType::class, [
                'entry_type' => EmployeeScoreFormType::class,
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
                'documentation' => [
                    'type' => 'array',
                    'description' => 'Scores for the evaluation criteria',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'criteria' => [
                                'type' => 'integer',
                                'description' => 'ID of the evaluation criteria',
                            ],
                            'comment' => [
                                'type' => 'string',
                                'description' => 'Comment for the criteria',
                            ],
                            'score' => [
                                'type' => 'number',
                                'description' => 'Score given for the criteria',
                            ],
                        ],
                    ],
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => EmployeeEvaluation::class,
            'csrf_protection' => false,
        ]);
    }
}
