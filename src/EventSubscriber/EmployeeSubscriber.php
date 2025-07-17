<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Event\Employee\CheckEmployeeLimitEvent;
use App\Repository\EmployeeRepository;
use LogicException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class EmployeeSubscriber
 *
 * @package App\EventSubscriber
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class EmployeeSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private EmployeeRepository $employeeRepository,
        private int                $maxFreeEmployees, private TranslatorInterface $translator,
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            CheckEmployeeLimitEvent::class => ['checkEmployeeLimitEvent', 0],
        ];
    }

    public function checkEmployeeLimitEvent(CheckEmployeeLimitEvent $event): void
    {
        $count = $this->employeeRepository->countByUser($event->user);

        if ($count >= $this->maxFreeEmployees) {
            throw new LogicException(
                $this->translator->trans('max_free_employees', ['%count%' => $this->maxFreeEmployees], domain: 'errors')
            );
        }
    }
}
