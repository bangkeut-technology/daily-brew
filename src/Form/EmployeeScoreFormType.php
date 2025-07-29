<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\EmployeeScore;
use App\Entity\EvaluationTemplateCriteria;
use App\Repository\EvaluationTemplateCriteriaRepository;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class EmployeeScoreFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class EmployeeScoreFormType extends AbstractType
{
    /**
     * @var UserInterface|null
     */
    private readonly ?UserInterface $user;

    public function __construct(Security $security)
    {
        $this->user = $security->getUser();
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('score', NumberType::class, [
                'documentation' => [
                    'type' => 'number',
                    'description' => 'Score for the evaluation',
                ],
            ])
            ->add('comment', TextType::class, [
                'documentation' => [
                    'type' => 'string',
                    'description' => 'Comment for the evaluation',
                ],
            ])
            ->add('criteria', EntityType::class, [
                'class' => EvaluationTemplateCriteria::class,
                'choice_label' => 'id',
                'query_builder' => function (EvaluationTemplateCriteriaRepository $repository): QueryBuilder {
                    return $repository->findByUserQueryBuilder($this->user);
                },
                'documentation' => [
                    'type' => 'integer',
                    'description' => 'Evaluation criteria ID',
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => EmployeeScore::class,
            'csrf_protection' => false,
        ]);
    }
}
