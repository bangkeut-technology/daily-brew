<?php
declare(strict_types=1);

namespace App\Form;

use Symfony\Component\Form\AbstractType;

/**
 * Class AbstractFormType
 *
 * @package App\Form
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class AbstractFormType extends AbstractType
{
    /**
     * Returns the name of the form type.
     *
     * @return string The name of the form type.
     */
    public function getBlockPrefix(): string
    {
        return '';
    }
}
