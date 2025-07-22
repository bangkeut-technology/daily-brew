<?php

declare(strict_types=1);

namespace App\Form\Type;

use App\Form\DataTransformer\DateTimeTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;

/**
 * Class DateTimeType.
 *
 * @author Vandeth THO <thovandeth@gmail.com>
 */
class DateTimeType extends AbstractType
{
    /**
     * DateTimeType constructor.
     */
    public function __construct(
        private readonly DateTimeTransformer $transformer,
    ) {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->addModelTransformer($this->transformer);
    }

    public function getParent(): string
    {
        return TextType::class;
    }
}
