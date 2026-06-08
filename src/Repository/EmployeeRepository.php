<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\DayOfWeekEnum;
use App\Enum\EmployeeAttendanceTrackingEnum;
use App\Enum\EmployeeRoleEnum;
use App\Enum\EmployeeStatusEnum;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractRepository<Employee>
 */
class EmployeeRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Employee::class, 12);
    }

    /** @return Employee[] */
    public function findByLinkedUser(User $user): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.linkedUser = :user')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('user', $user)
            ->orderBy('e.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findOneByLinkedUserAndWorkspace(User $user, Workspace $workspace): ?Employee
    {
        return $this->createQueryBuilder('e')
            ->where('e.linkedUser = :user')
            ->andWhere('e.workspace = :ws')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('user', $user)
            ->setParameter('ws', $workspace)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** @return Employee[] */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.workspace = :ws')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('ws', $workspace)
            ->orderBy('e.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /** @return Employee[] */
    public function findActiveByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.workspace = :ws')
            ->andWhere('e.status = :status')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('ws', $workspace)
            ->setParameter('status', EmployeeStatusEnum::ACTIVE)
            ->orderBy('e.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Employees whose active window overlaps the given date range — i.e. either
     * still active, or deactivated on/after `from`. Used by attendance list /
     * summary so historical absent/present rows for deactivated employees stay
     * visible for the days they were employed.
     *
     * @return Employee[]
     */
    public function findActiveDuringRangeByWorkspace(
        Workspace $workspace,
        \DateTimeImmutable $from,
    ): array {
        return $this->createQueryBuilder('e')
            ->where('e.workspace = :ws')
            ->andWhere('e.deletedAt IS NULL')
            ->andWhere('e.status = :active OR e.leftAt >= :from')
            ->setParameter('ws', $workspace)
            ->setParameter('active', EmployeeStatusEnum::ACTIVE)
            ->setParameter('from', $from)
            ->orderBy('e.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function countActiveByWorkspace(Workspace $workspace): int
    {
        return (int) $this->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->where('e.workspace = :ws')
            ->andWhere('e.status = :status')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('ws', $workspace)
            ->setParameter('status', EmployeeStatusEnum::ACTIVE)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Active employees who are subject to attendance tracking — feeds the dashboard
     * "absent" calculation and the daily-summary baseline. Employees with
     * attendanceTracking=None are excluded because the owner has opted them out
     * of absent counts entirely (admin helpers, flexible-hours staff, etc.).
     *
     * Note: this is intentionally distinct from countActiveByWorkspace() which
     * still includes None-tracked employees because they occupy a seat against
     * the plan's employee limit.
     */
    public function countAttendanceTrackedByWorkspace(Workspace $workspace): int
    {
        return (int) $this->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->where('e.workspace = :ws')
            ->andWhere('e.status = :status')
            ->andWhere('e.deletedAt IS NULL')
            ->andWhere('e.attendanceTracking = :tracking')
            ->setParameter('ws', $workspace)
            ->setParameter('status', EmployeeStatusEnum::ACTIVE)
            ->setParameter('tracking', EmployeeAttendanceTrackingEnum::Full)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Subset of countAttendanceTrackedByWorkspace() restricted to employees
     * whose shift schedules them on the given weekday. Used by the dashboard
     * "absent" calculation so a Mon-Fri GM doesn't inflate the absent count on
     * Saturday. Employees with no shift, or a shift that has no per-day rules
     * at all, are always counted (legacy "every day" semantics).
     *
     * We eager-load shift + timeRules and filter in PHP via Shift::isScheduledOn
     * — workspaces are small (rarely > 50 employees) so one query beats the
     * subquery gymnastics required to express this in DQL cleanly.
     */
    public function countAttendanceTrackedAndScheduledOn(Workspace $workspace, DayOfWeekEnum $day): int
    {
        /** @var Employee[] $employees */
        $employees = $this->createQueryBuilder('e')
            ->leftJoin('e.shift', 's')->addSelect('s')
            ->leftJoin('s.timeRules', 'r')->addSelect('r')
            ->where('e.workspace = :ws')
            ->andWhere('e.status = :status')
            ->andWhere('e.deletedAt IS NULL')
            ->andWhere('e.attendanceTracking = :tracking')
            ->setParameter('ws', $workspace)
            ->setParameter('status', EmployeeStatusEnum::ACTIVE)
            ->setParameter('tracking', EmployeeAttendanceTrackingEnum::Full)
            ->getQuery()
            ->getResult();

        $count = 0;
        foreach ($employees as $emp) {
            $shift = $emp->getShift();
            if ($shift === null || $shift->isScheduledOn($day)) {
                $count++;
            }
        }
        return $count;
    }

    public function findDuplicate(Workspace $workspace, string $firstName, string $lastName): ?Employee
    {
        return $this->createQueryBuilder('e')
            ->where('e.workspace = :ws')
            ->andWhere('e.firstName = :fn')
            ->andWhere('e.lastName = :ln')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('ws', $workspace)
            ->setParameter('fn', $firstName)
            ->setParameter('ln', $lastName)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countManagersByWorkspace(Workspace $workspace): int
    {
        return (int) $this->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->where('e.workspace = :ws')
            ->andWhere('e.role = :role')
            ->andWhere('e.status = :status')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('ws', $workspace)
            ->setParameter('role', EmployeeRoleEnum::MANAGER)
            ->setParameter('status', EmployeeStatusEnum::ACTIVE)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /** @return Employee[] Active employees with a username (for BasilBook integration). */
    public function findWithUsernameByWorkspace(Workspace $workspace): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.workspace = :ws')
            ->andWhere('e.username IS NOT NULL')
            ->andWhere('e.status = :status')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('ws', $workspace)
            ->setParameter('status', EmployeeStatusEnum::ACTIVE)
            ->orderBy('e.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /** Soft-delete all employees created by the given user. */
    public function softDeleteByCreator(User $user, \DateTimeImmutable $deletedAt): void
    {
        $this->createQueryBuilder('e')
            ->update()
            ->set('e.deletedAt', ':now')
            ->where('e.user = :user')
            ->andWhere('e.deletedAt IS NULL')
            ->setParameter('now', $deletedAt)
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }
}
