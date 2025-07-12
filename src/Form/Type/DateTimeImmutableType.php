<?php
declare(strict_types=1);


namespace App\Form\Type;

use App\Form\DataTransformer\DateTimeImmutableTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;

/**
 * Class DateTimeImmutableType
 *
 * @package App\Form\Type
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class DateTimeImmutableType extends AbstractType
{
    /**
     * DateTimeImmutableType constructor.
     *
     * @param DateTimeImmutableTransformer $transformer
     */
    public function __construct(
        private readonly DateTimeImmutableTransformer $transformer
    )
    {
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
    public function getParent(): string
    {
        return TextType::class;
    }
}