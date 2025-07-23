<?php

declare(strict_types=1);

namespace App\Event\EvaluationCriteria;

use App\Entity\EvaluationCriteria;
use App\Entity\EvaluationTemplate;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Class EvaluationCriteriaCreatedEvent
 *
 * @package App\Event\EvaluationCriteria
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class EvaluationCriteriaCreatedEvent extends Event
{
    /**
     * @param EvaluationCriteria   $criteria
     * @param EvaluationTemplate[] $templates
     */
    public function __construct(
        public readonly EvaluationCriteria $criteria,
        public readonly array              $templates,
    )
    {
    }
}
