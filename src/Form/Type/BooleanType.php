<?php

declare(strict_types=1);

namespace App\Form\Type;

use App\Form\DataTransformer\BooleanTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class BooleanType.
 *
 * @author Vandeth Tho <thovandeth@gmail.com>
 */
class BooleanType extends AbstractType
{
    /**
     * BooleanType constructor.
     */
    public function __construct(
        private readonly BooleanTransformer $transformer,
    ) {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->addModelTransformer($this->transformer);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'choices' => [
                'form.choice.yes' => 'true',
                'form.choice.no' => 'false',
                'form.choice.1' => '1',
                'form.choice.0' => '0',
            ],
            'multiple' => false,
            'expanded' => true,
        ]);
    }

    public function getParent(): string
    {
        return ChoiceType::class;
    }
}
