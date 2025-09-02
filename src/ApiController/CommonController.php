<?php
declare(strict_types=1);

namespace App\ApiController;

use App\Controller\AbstractController;
use App\Entity\EvaluationTemplate;
use App\Repository\EmployeeEvaluationRepository;
use App\Util\DateHelper;
use DateMalformedStringException;
use DateTimeImmutable;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

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
     * @throws DateMalformedStringException
     */
    #[OA\Parameter(
        name: 'from',
        description: 'Start date of the period (YYYY-MM-DD)',
        in: 'query',
        required: true,
        schema: new OA\Schema(type: 'string', format: 'date')
    )]
    #[OA\Parameter(
        name: 'to',
        description: 'End date of the period (YYYY-MM-DD)',
        in: 'query',
        required: true,
        schema: new OA\Schema(type: 'string', format: 'date')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns the metric for the period',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'averageKpi', type: 'number', format: 'float'),
                new OA\Property(property: 'attendanceRate', type: 'number', format: 'float'),
                new OA\Property(property: 'totalEmployees', type: 'integer', example: 8),
                new OA\Property(property: 'leavesToday', type: 'integer', example: 1),
            ]
        )
    )]
    #[Route('/metric', name: 'metric')]
    public function metric(
        Request $request,
        EmployeeEvaluationRepository $employeeEvaluationRepository,
    ): JsonResponse
    {
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth()->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth()->format('Y-m-d')));

        $data = [
            'averageKpi' => $employeeEvaluationRepository->getAverageScoresForPeriodByUser($this->getUser(), $from, $to),
            'attendanceRate' => 0,
            'totalEmployees' => 0,
            'leavesToday' => 0,
        ];




        return $this->json($data);
    }
}
