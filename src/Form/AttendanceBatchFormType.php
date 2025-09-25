<?php
declare(strict_types=1);


namespace App\Form;

use App\Entity\AttendanceBatch;
use App\Entity\Employee;
use App\Entity\User;
use App\Enum\AttendanceBatchTypeEnum;
use App\Form\Type\DateTimeImmutableType;
use App\Form\Type\DateTimeType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EnumType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class AttendanceBatchFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class AttendanceBatchFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('type', EnumType::class, [
                'class' => AttendanceBatchTypeEnum::class,
            ])
            ->add('label', TextType::class)
            ->add('note', TextType::class)
            ->add('fromDate', DateTimeImmutableType::class)
            ->add('toDate', DateTimeImmutableType::class)
            ->add('employees', EntityType::class, [
                'class' => Employee::class,
                'mapped' => false,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => AttendanceBatch::class,
            'csrf_protection' => false,
        ]);
    }
}
