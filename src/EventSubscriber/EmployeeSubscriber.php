<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Event\Employee\CheckEmployeeLimitEvent;
use App\Repository\EmployeeRepository;
use LogicException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

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
        private Security           $security,
        private int                $maxFreeEmployees,
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            CheckEmployeeLimitEvent::class => ['checkEmployeeLimitEvent', 0],
        ];
    }

    public function checkEmployeeLimitEvent(): void
    {
        $count = $this->employeeRepository->countByUser($this->security->getUser());

        if ($count >= $this->maxFreeEmployees) {
            throw new LogicException(sprintf(
                'Free plan allows only %d employees.',
                $this->maxFreeEmployees
            ));
        }
    }
}
