<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Event\EvaluationCriteria\EvaluationCriteriaCreatedEvent;
use App\Repository\EvaluationTemplateCriteriaRepository;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Class EvaluationTemplateSubscriber.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class EvaluationCriteriaSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private EvaluationTemplateCriteriaRepository $templateCriteriaRepository,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            EvaluationCriteriaCreatedEvent::class => ['onEvaluationCriteriaCreated', 0],
        ];
    }

    /**
     * Handle the EvaluationCriteriaCreatedEvent to create template criteria.
     *
     * @param EvaluationCriteriaCreatedEvent $event
     */
    public function onEvaluationCriteriaCreated(EvaluationCriteriaCreatedEvent $event): void
    {
        foreach ($event->templates as $index => $template) {
            $templateCriteria = $this->templateCriteriaRepository->create();
            $templateCriteria->setTemplate($template);
            $templateCriteria->setCriteria($event->criteria);
            $templateCriteria->setWeight($event->criteria->getWeight());
            $this->templateCriteriaRepository->persist($templateCriteria);
            if (0 === $index % 20) {
                $this->templateCriteriaRepository->flush();
            }
        }
    }
}
