<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Event\EvaluationTemplate\EvaluationTemplateCreatedEvent;
use App\Repository\EvaluationTemplateCriteriaRepository;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Class EvaluationTemplateSubscriber
 *
 * @package App\EventSubscriber
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class EvaluationTemplateSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private EvaluationTemplateCriteriaRepository $templateCriteriaRepository,
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            EvaluationTemplateCreatedEvent::class => ['onEvaluationTemplateCreated', 0],
        ];
    }

    /**
     * Handles the EvaluationTemplateCreatedEvent to create template criteria.
     *
     * @param EvaluationTemplateCreatedEvent $event
     */
    public function onEvaluationTemplateCreated(EvaluationTemplateCreatedEvent $event): void
    {
        foreach ($event->criterias as $index => $criteria) {
            $templateCriteria = $this->templateCriteriaRepository->create();
            $templateCriteria->setTemplate($event->template);
            $templateCriteria->setCriteria($criteria);
            $templateCriteria->setWeight($criteria->getWeight());
            $this->templateCriteriaRepository->persist($templateCriteria);
            if ($index % 20 === 0) {
                $this->templateCriteriaRepository->flush();
            }
        }
    }
}
