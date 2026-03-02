<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\WorkspaceAllowedIp;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Ip;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Class WorkspaceAllowedIpFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class WorkspaceAllowedIpFormType extends AbstractFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('ip', TextType::class, [
                'required' => true,
                'constraints' => [
                    new NotBlank(),
                    new Ip(['version' => Ip::ALL]),
                ],
                'documentation' => [
                    'description' => 'IPv4 or IPv6 address',
                    'type' => 'string',
                    'example' => '192.168.1.1',
                ],
            ])
            ->add('label', TextType::class, [
                'required' => false,
                'documentation' => [
                    'description' => 'Optional human-readable label for this IP',
                    'type' => 'string',
                    'example' => 'Office network',
                ],
            ])
            ->add('isActive', CheckboxType::class, [
                'required' => false,
                'documentation' => [
                    'description' => 'Whether this IP restriction is active',
                    'type' => 'boolean',
                    'example' => true,
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => WorkspaceAllowedIp::class,
            'csrf_protection' => false,
        ]);
    }
}
