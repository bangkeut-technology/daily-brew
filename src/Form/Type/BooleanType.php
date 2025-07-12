<?php
declare(strict_types=1);


namespace App\Form\Type;

use App\Form\DataTransformer\BooleanTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class BooleanType
 *
 * @package App\Form\Types\Custom
 *
 * @author Vandeth Tho <thovandeth@gmail.com>
 */
class BooleanType extends AbstractType
{
    /**
     * BooleanType constructor.
     *
     * @param BooleanTransformer $transformer
     */
    public function __construct(
        private readonly BooleanTransformer $transformer
    ) {
    }

    /**
     * @inheritDoc
     */
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->addModelTransformer($this->transformer);
    }

    /**
     * @inheritDoc
     */
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'choices'  => [
                'form.choice.yes' => 'true',
                'form.choice.no'  => 'false',
                'form.choice.1' => '1',
                'form.choice.0'  => '0',
            ],
            'multiple' => false,
            'expanded' => true,
        ]);
    }

    /**
     * @inheritDoc
     */
    public function getParent(): string
    {
        return ChoiceType::class;
    }
}
