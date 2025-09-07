<?php
declare(strict_types=1);

namespace App\ApiController;

use App\Controller\AbstractController;
use App\Enum\AttendanceStatusEnum;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeEvaluationRepository;
use App\Repository\EmployeeRepository;
use App\Service\AttendanceRateCalculator;
use App\Util\DateHelper;
use DateMalformedStringException;
use DateTimeImmutable;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use function count;

/**
 * Class CommonController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/commons', name: 'common_')]
class CommonController extends AbstractController
{
    /**
     * Handles the metric computation for a specified period.
     *
     * @param Request                      $request                      The HTTP request object containing query parameters 'from' and 'to' for the period.
     * @param EmployeeEvaluationRepository $employeeEvaluationRepository Repository to fetch employee evaluation data.
     * @param EmployeeRepository           $employeeRepository           Repository to fetch employee data.
     *
     * @return JsonResponse Returns a JSON response containing the average KPI, attendance rate, total employees, and leaves for the day.
     *
     * @throws DateMalformedStringException
     */
    #[OA\Parameter(
        name: 'from',
        description: 'Start date (YYYY-MM-DD). Defaults to first day of current month.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', format: 'date')
    )]
    #[OA\Parameter(
        name: 'to',
        description: 'End date (YYYY-MM-DD). Defaults to last day of current month.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', format: 'date')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Metrics for the requested period',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'averageKpi', type: 'number', format: 'float', example: 3.72),
                new OA\Property(property: 'attendanceRate', type: 'number', format: 'float', example: 0.91),
                new OA\Property(property: 'totalEmployees', type: 'integer', example: 8),
                new OA\Property(property: 'leavesToday', type: 'integer', example: 1),
                new OA\Property(property: 'rangeDays', type: 'integer', example: 31),
            ]
        )
    )]
    #[Route('/metrics', name: 'metrics', methods: ['GET'])]
    public function metrics(
        Request                      $request,
        AttendanceRateCalculator     $attendanceRateCalculator,
        AttendanceRepository         $attendanceRepository,
        EmployeeEvaluationRepository $employeeEvaluationRepository,
        EmployeeRepository           $employeeRepository,
    ): JsonResponse
    {
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth()->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth()->format('Y-m-d')));
        $user = $this->getUser();

        $employees = $employeeRepository->findActiveByOwner($user);

        $teamRate = 0.0;
        $count = count($employees);
        if ($count > 0) {
            $sum = 0.0;
            foreach ($employees as $employee) {
                $sum += $attendanceRateCalculator->calculateRate($employee, $from, $to); // returns percentage (0–100)
            }
            $teamRate = round(($sum / $count) / 100, 4);
        }
        $totalEmployees = $count;

        // 4) Leaves today.
        $today = new DateTimeImmutable('today');
        $leavesToday = $attendanceRepository->countByStatusOnDateForOwner(
            $user,
            $today,
            AttendanceStatusEnum::LEAVE
        );

        $data = [
            'averageKpi'      => $employeeEvaluationRepository->getAverageScoresForPeriodByUser($user, $from, $to),
            'attendanceRate'  => $teamRate,
            'totalEmployees'  => $totalEmployees,
            'leavesToday'     => $leavesToday,
            'rangeDays'       => DateHelper::daysBetween($from, $to, true),
        ];

        return $this->json($data);
    }
}
