<?php
declare(strict_types=1);


namespace App\Form;


use App\Entity\Employee;
use App\Entity\EvaluationCriteria;
use App\Entity\EvaluationTemplate;
use App\Entity\User;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EvaluationTemplateFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class EvaluationTemplateFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name')
            ->add('description')
            ->add('criterias', null, [
                'class' => EvaluationCriteria::class,
                'choice_label' => 'id',
                'multiple' => true,
                'mapped' => false,
            ])
            ->add('employees', EntityType::class, [
                'class' => Employee::class,
                'choice_label' => 'id',
                'multiple' => true,
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
