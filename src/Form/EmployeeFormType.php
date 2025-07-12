<?php
declare(strict_types=1);


namespace App\Form;

use App\Entity\Employee;
use App\Entity\EvaluationTemplate;
use App\Entity\Role;
use App\Entity\Store;
use App\Entity\User;
use App\Form\Type\DateTimeImmutableType;
use Doctrine\DBAL\Types\DateImmutableType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EmployeeFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class EmployeeFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('firstName')
            ->add('lastName')
            ->add('phoneNumber')
            ->add('dob', DateTimeImmutableType::class)
            ->add('joinedAt', DateTimeImmutableType::class)
            ->add('status')
            ->add('roles', EntityType::class, [
                'class' => Role::class,
                'choice_label' => 'id',
                'multiple' => true,
            ])
            ->add('templates', EntityType::class, [
                'class' => EvaluationTemplate::class,
                'choice_label' => 'id',
                'multiple' => true,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Employee::class,
            'csrf_protection' => false,
        ]);
    }

    public function getBlockPrefix(): string
    {
        return '';
    }
}
