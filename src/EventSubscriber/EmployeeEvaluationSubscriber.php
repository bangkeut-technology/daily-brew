<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use App\Event\EmployeeEvaluation\FinalizeEmployeeEvaluationEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Class EmployeeEvaluationSubscriber.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class EmployeeEvaluationSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            FinalizeEmployeeEvaluationEvent::class => 'onFinalizeEvaluation',
        ];
    }

    /**
     * Handles the FinalizeEmployeeEvaluationEvent to calculate scores and average.
     *
     * @param FinalizeEmployeeEvaluationEvent $event The event containing the evaluation
     */
    public function onFinalizeEvaluation(FinalizeEmployeeEvaluationEvent $event): void
    {
        $evaluation = $event->evaluation;

        $evaluation->setTemplateName($evaluation->getTemplate()?->getName());

        $totalScore = 0;
        $totalWeight = 0;

        foreach ($evaluation->getScores() as $score) {
            $criteria = $score->getCriteria();
            $label = $criteria->getCriteria()?->getLabel();
            $weight = $criteria->getWeight();

            $score->setCriteriaLabel($label);
            $score->setWeight($weight);

            $totalScore += $score->getScore() * $weight;
            $totalWeight += $weight;
        }

        $average = $totalWeight > 0 ? $totalScore / $totalWeight : null;
        $evaluation->setAverageScore($average);
    }
}
