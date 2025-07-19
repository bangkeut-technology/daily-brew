<?php
declare(strict_types=1);


namespace App\Form;

use App\Entity\Employee;
use App\Entity\EmployeeEvaluation;
use App\Entity\EvaluationTemplate;
use App\Entity\EvaluationTemplateCriteria;
use App\Entity\User;
use App\Repository\EvaluationCriteriaRepository;
use App\Repository\EvaluationTemplateCriteriaRepository;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EmployeeEvaluationFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class EmployeeEvaluationFormType extends AbstractType
{
    /**
     * @var User|null
     */
    private readonly ?User $user;

    public function __construct(
        Security $security,
    )
    {
        $this->user = $security->getUser();
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('notes')
            ->add('template', EntityType::class, [
                'class' => EvaluationTemplate::class,
                'choice_label' => 'id',
                'query_builder' => function (EvaluationCriteriaRepository $repository): QueryBuilder {
                    return $repository->findByUserQueryBuilder($this->user);
                },
            ])
            ->add('scores', CollectionType::class, [
                'entry_type' => EmployeeScoreFormType::class,
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => EmployeeEvaluation::class,
            'csrf_protection' => false
        ]);
    }
}
