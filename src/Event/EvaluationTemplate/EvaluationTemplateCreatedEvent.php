<?php
declare(strict_types=1);

namespace App\Event\EvaluationTemplate;

use App\Entity\EvaluationCriteria;
use App\Entity\EvaluationTemplate;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Class EvaluationTemplateCreatedEvent
 *
 * @package App\Event\EvaluationTemplate
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class EvaluationTemplateCreatedEvent extends Event
{
    public function __construct(
        public readonly EvaluationTemplate $template,
        /** @var EvaluationCriteria[] */
        public readonly array $criterias
    ) {}
}
