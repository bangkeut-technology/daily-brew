<?php

declare(strict_types=1);

namespace App\ApiController\Admin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\AdminAuditLog;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\PlanEnum;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\AdminAuditLogRepository;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Service\DateService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin')]
class AdminDashboardController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/dashboard', name: 'admin_dashboard', methods: ['GET'])]
    public function dashboard(
        UserRepository $userRepository,
        WorkspaceRepository $workspaceRepository,
        EmployeeRepository $employeeRepository,
        AttendanceRepository $attendanceRepository,
        SubscriptionRepository $subscriptionRepository,
        AdminAuditLogRepository $auditRepository,
    ): JsonResponse {
        $totalWorkspaces = $workspaceRepository->count(['deletedAt' => null]);

        // Subscription counts grouped by plan, restricted to active + trialing —
        // canceled / past_due / paused subscriptions don't grant the paid plan.
        $byPlanRows = $subscriptionRepository->createQueryBuilder('s')
            ->select('s.plan AS plan, COUNT(s.id) AS c')
            ->where('s.status IN (:statuses)')
            ->setParameter('statuses', [SubscriptionStatusEnum::Active, SubscriptionStatusEnum::Trialing])
            ->groupBy('s.plan')
            ->getQuery()
            ->getArrayResult();

        $byPlan = [PlanEnum::Free->value => 0, PlanEnum::Espresso->value => 0, PlanEnum::DoubleEspresso->value => 0];
        $paidWorkspaces = 0;
        foreach ($byPlanRows as $row) {
            $plan = $row['plan'] instanceof PlanEnum ? $row['plan']->value : (string) $row['plan'];
            $count = (int) $row['c'];
            if (isset($byPlan[$plan])) {
                $byPlan[$plan] = $count;
            }
            if ($plan !== PlanEnum::Free->value) {
                $paidWorkspaces += $count;
            }
        }
        // Free = every active workspace not on an active paid plan
        $byPlan[PlanEnum::Free->value] = max(0, $totalWorkspaces - $paidWorkspaces);

        // Subscription status breakdown — every status, including 0 buckets so the UI
        // can render a stable shape.
        $byStatusRows = $subscriptionRepository->createQueryBuilder('s')
            ->select('s.status AS status, COUNT(s.id) AS c')
            ->groupBy('s.status')
            ->getQuery()
            ->getArrayResult();

        $byStatus = array_fill_keys(array_map(fn (SubscriptionStatusEnum $s) => $s->value, SubscriptionStatusEnum::cases()), 0);
        foreach ($byStatusRows as $row) {
            $status = $row['status'] instanceof SubscriptionStatusEnum ? $row['status']->value : (string) $row['status'];
            if (isset($byStatus[$status])) {
                $byStatus[$status] = (int) $row['c'];
            }
        }

        // Growth — counts for the last 7 and 30 days
        $sevenDaysAgo = DateService::relative('-7 days');
        $thirtyDaysAgo = DateService::relative('-30 days');

        $usersLast7d = (int) $userRepository->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.createdAt >= :d')
            ->setParameter('d', $sevenDaysAgo)
            ->getQuery()
            ->getSingleScalarResult();

        $usersLast30d = (int) $userRepository->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.createdAt >= :d')
            ->setParameter('d', $thirtyDaysAgo)
            ->getQuery()
            ->getSingleScalarResult();

        $workspacesLast7d = (int) $workspaceRepository->createQueryBuilder('w')
            ->select('COUNT(w.id)')
            ->where('w.deletedAt IS NULL')
            ->andWhere('w.createdAt >= :d')
            ->setParameter('d', $sevenDaysAgo)
            ->getQuery()
            ->getSingleScalarResult();

        $workspacesLast30d = (int) $workspaceRepository->createQueryBuilder('w')
            ->select('COUNT(w.id)')
            ->where('w.deletedAt IS NULL')
            ->andWhere('w.createdAt >= :d')
            ->setParameter('d', $thirtyDaysAgo)
            ->getQuery()
            ->getSingleScalarResult();

        $employeesLast7d = (int) $employeeRepository->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->where('e.deletedAt IS NULL')
            ->andWhere('e.createdAt >= :d')
            ->setParameter('d', $sevenDaysAgo)
            ->getQuery()
            ->getSingleScalarResult();

        $employeesLast30d = (int) $employeeRepository->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->where('e.deletedAt IS NULL')
            ->andWhere('e.createdAt >= :d')
            ->setParameter('d', $thirtyDaysAgo)
            ->getQuery()
            ->getSingleScalarResult();

        // Attendance counted by check-in date (workspace-local), not row creation.
        $sevenDaysAgoDate = DateService::relative('-7 days')->format('Y-m-d');
        $thirtyDaysAgoDate = DateService::relative('-30 days')->format('Y-m-d');

        $attendancesLast7d = (int) $attendanceRepository->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->where('a.date >= :d')
            ->setParameter('d', $sevenDaysAgoDate)
            ->getQuery()
            ->getSingleScalarResult();

        $attendancesLast30d = (int) $attendanceRepository->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->where('a.date >= :d')
            ->setParameter('d', $thirtyDaysAgoDate)
            ->getQuery()
            ->getSingleScalarResult();

        // Daily chart series — last 30 days, one bucket per day, zero-filled.
        $dayKeys = [];
        $cursor = DateService::relative('-29 days');
        for ($i = 0; $i < 30; $i++) {
            $dayKeys[] = $cursor->format('Y-m-d');
            $cursor = $cursor->modify('+1 day');
        }
        $emptyBuckets = array_fill_keys($dayKeys, 0);

        $usersByDay = $this->bucketByDay(
            $userRepository->createQueryBuilder('u')
                ->select("SUBSTRING(u.createdAt, 1, 10) AS day, COUNT(u.id) AS c")
                ->where('u.createdAt >= :d')
                ->setParameter('d', $thirtyDaysAgo)
                ->groupBy('day')
                ->getQuery()
                ->getArrayResult(),
            $emptyBuckets,
        );

        $workspacesByDay = $this->bucketByDay(
            $workspaceRepository->createQueryBuilder('w')
                ->select("SUBSTRING(w.createdAt, 1, 10) AS day, COUNT(w.id) AS c")
                ->where('w.deletedAt IS NULL')
                ->andWhere('w.createdAt >= :d')
                ->setParameter('d', $thirtyDaysAgo)
                ->groupBy('day')
                ->getQuery()
                ->getArrayResult(),
            $emptyBuckets,
        );

        $employeesByDay = $this->bucketByDay(
            $employeeRepository->createQueryBuilder('e')
                ->select("SUBSTRING(e.createdAt, 1, 10) AS day, COUNT(e.id) AS c")
                ->where('e.deletedAt IS NULL')
                ->andWhere('e.createdAt >= :d')
                ->setParameter('d', $thirtyDaysAgo)
                ->groupBy('day')
                ->getQuery()
                ->getArrayResult(),
            $emptyBuckets,
        );

        $attendancesByDay = $this->bucketByDay(
            $attendanceRepository->createQueryBuilder('a')
                ->select("SUBSTRING(a.date, 1, 10) AS day, COUNT(a.id) AS c")
                ->where('a.date >= :d')
                ->setParameter('d', $thirtyDaysAgoDate)
                ->groupBy('day')
                ->getQuery()
                ->getArrayResult(),
            $emptyBuckets,
        );

        $growthSeries = array_map(fn (string $day) => [
            'date' => $day,
            'users' => $usersByDay[$day],
            'workspaces' => $workspacesByDay[$day],
            'employees' => $employeesByDay[$day],
            'attendances' => $attendancesByDay[$day],
        ], $dayKeys);

        // Last 5 signups
        /** @var User[] $recentSignups */
        $recentSignups = $userRepository->createQueryBuilder('u')
            ->orderBy('u.createdAt', 'DESC')
            ->setMaxResults(5)
            ->getQuery()
            ->getResult();

        // Last 5 active workspaces (with owner)
        /** @var Workspace[] $recentWorkspaces */
        $recentWorkspaces = $workspaceRepository->createQueryBuilder('w')
            ->leftJoin('w.owner', 'o')->addSelect('o')
            ->where('w.deletedAt IS NULL')
            ->orderBy('w.createdAt', 'DESC')
            ->setMaxResults(5)
            ->getQuery()
            ->getResult();

        // Last 10 admin actions
        /** @var AdminAuditLog[] $recentActivity */
        $recentActivity = $auditRepository->createQueryBuilder('a')
            ->leftJoin('a.actor', 'u')->addSelect('u')
            ->orderBy('a.createdAt', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();

        // Subscription headline excludes canceled rows — those are tombstones
        // (e.g. deleted workspaces) and shouldn't inflate the live count.
        // Active + trialing + past_due + paused all count as "real."
        $liveSubscriptions = $subscriptionRepository->count([
            'status' => [
                SubscriptionStatusEnum::Active,
                SubscriptionStatusEnum::Trialing,
                SubscriptionStatusEnum::PastDue,
                SubscriptionStatusEnum::Paused,
            ],
        ]);

        return $this->jsonSuccess([
            'totals' => [
                'users' => $userRepository->count([]),
                'workspaces' => $totalWorkspaces,
                'employees' => $employeeRepository->count(['deletedAt' => null]),
                'attendances' => $attendanceRepository->count([]),
                'subscriptions' => $liveSubscriptions,
            ],
            'byPlan' => $byPlan,
            'byStatus' => $byStatus,
            'growth' => [
                'usersLast7d' => $usersLast7d,
                'usersLast30d' => $usersLast30d,
                'workspacesLast7d' => $workspacesLast7d,
                'workspacesLast30d' => $workspacesLast30d,
                'employeesLast7d' => $employeesLast7d,
                'employeesLast30d' => $employeesLast30d,
                'attendancesLast7d' => $attendancesLast7d,
                'attendancesLast30d' => $attendancesLast30d,
            ],
            'growthSeries' => $growthSeries,
            'recentSignups' => array_map(fn (User $u) => [
                'publicId' => (string) $u->getPublicId(),
                'email' => $u->getEmail(),
                'fullName' => $u->getFullName(),
                'createdAt' => $u->getCreatedAt()->format('c'),
            ], $recentSignups),
            'recentWorkspaces' => array_map(fn (Workspace $w) => [
                'publicId' => (string) $w->getPublicId(),
                'name' => $w->getName(),
                'owner' => $w->getOwner() ? [
                    'publicId' => (string) $w->getOwner()->getPublicId(),
                    'email' => $w->getOwner()->getEmail(),
                ] : null,
                'createdAt' => $w->getCreatedAt()->format('c'),
            ], $recentWorkspaces),
            'recentActivity' => array_map(fn (AdminAuditLog $log) => [
                'publicId' => (string) $log->getPublicId(),
                'action' => $log->getAction()->value,
                'actionLabel' => $log->getAction()->label(),
                'actorEmail' => $log->getActorEmail() ?? $log->getActor()?->getEmail(),
                'targetType' => $log->getTargetType(),
                'targetPublicId' => $log->getTargetPublicId(),
                'targetLabel' => $log->getTargetLabel(),
                'createdAt' => $log->getCreatedAt()->format('c'),
            ], $recentActivity),
        ]);
    }

    /**
     * @param array<int, array{day: string|null, c: int|string}> $rows
     * @param array<string, int>                                 $emptyBuckets
     *
     * @return array<string, int>
     */
    private function bucketByDay(array $rows, array $emptyBuckets): array
    {
        $buckets = $emptyBuckets;
        foreach ($rows as $row) {
            $day = (string) ($row['day'] ?? '');
            if (isset($buckets[$day])) {
                $buckets[$day] = (int) $row['c'];
            }
        }

        return $buckets;
    }
}
