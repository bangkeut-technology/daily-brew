<?php
declare(strict_types=1);

namespace App\Service;

use App\Entity\DemoSession;
use App\Repository\AttendanceBatchRepository;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\EvaluationCriteriaRepository;
use App\Repository\EvaluationTemplateRepository;
use App\Repository\RoleRepository;
use DateTimeImmutable;


/**
 * Class DemoSessionCleanUpService
 *
 * @package App\Service
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class DemoSessionCleanUpService
{
    public function __construct(
        private EvaluationCriteriaRepository $evaluationCriteriaRepository,
        private EvaluationTemplateRepository $templateRepository,
        private EmployeeRepository           $employeeRepository,
        private AttendanceRepository         $attendanceRepository,
        private AttendanceBatchRepository    $batchRepository,
        private RoleRepository               $roleRepository,
    )
    {
    }

    /**
     * Cleans up expired demo sessions and related data.
     *
     * @return array{processed:int, totals:array<string,int>}
     */
    public function cleanUp(DemoSession $session, DateTimeImmutable $asOf): array
    {
        $user = $session->getUser();
        return [
            'criteria' => $this->evaluationCriteriaRepository->deleteByUser($user),
            'templates' => $this->templateRepository->deleteByUser($user),
            'employees' => $this->employeeRepository->deleteByUser($user),
            'attendances' => $this->attendanceRepository->deleteByUser($user),
            'batches' => $this->batchRepository->deleteByUser($user),
            'roles' => $this->roleRepository->deleteByUser($user),
        ];
    }
}
