<?php

declare(strict_types=1);

namespace App\Event\EvaluationTemplate;

use App\Entity\EvaluationCriteria;
use App\Entity\EvaluationTemplate;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Class EvaluationTemplateCreatedEvent.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class EvaluationTemplateCreatedEvent extends Event
{
    /**
     * @param EvaluationTemplate $template
     * @param EvaluationCriteria[] $criterias
     */
    public function __construct(
        public readonly EvaluationTemplate $template,
        public readonly array $criterias,
    ) {
    }
}
