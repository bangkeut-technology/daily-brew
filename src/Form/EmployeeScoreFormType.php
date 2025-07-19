<?php
declare(strict_types=1);

namespace App\Form;

use App\Entity\EmployeeEvaluation;
use App\Entity\EmployeeScore;
use App\Entity\EvaluationTemplateCriteria;
use App\Repository\EvaluationTemplateCriteriaRepository;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Form\AbstractType;
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
            ->add('score')
            ->add('comment')
            ->add('criteria', EntityType::class, [
                'class' => EvaluationTemplateCriteria::class,
                'choice_label' => 'id',
                'query_builder' => function (EvaluationTemplateCriteriaRepository $repository): QueryBuilder {
                    return $repository->findByUserQueryBuilder($this->user);
                },
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
