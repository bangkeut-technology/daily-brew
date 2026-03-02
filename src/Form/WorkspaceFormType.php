<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\Workspace;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Class WorkspaceFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class WorkspaceFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'required' => true,
                'constraints' => [
                    new NotBlank(),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Workspace::class,
            'csrf_protection' => false,
        ]);
    }
}
