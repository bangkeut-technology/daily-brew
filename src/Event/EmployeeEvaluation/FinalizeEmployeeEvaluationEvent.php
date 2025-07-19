<?php
declare(strict_types=1);

namespace App\Event\EmployeeEvaluation;

use App\Entity\EmployeeEvaluation;
use Symfony\Contracts\EventDispatcher\Event;

/**
 * Class FinalizeEmployeeEvaluationEvent
 *
 * @package App\Event\EmployeeEvaluation
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final class FinalizeEmployeeEvaluationEvent extends Event
{
    public function __construct(
        public readonly EmployeeEvaluation $evaluation
    )
    {

    }
}
