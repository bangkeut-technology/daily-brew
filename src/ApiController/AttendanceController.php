<?php
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\AttendanceTrait;
use App\Controller\AbstractController;
use App\Entity\Attendance;
use App\Repository\AttendanceRepository;
use App\Util\DateHelper;
use DateTimeImmutable;
use Exception;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class AttendanceController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/attendances', name: 'attendances_')]
#[OA\Tag(name: 'Attendance')]
class AttendanceController extends AbstractController
{
    use AttendanceTrait;

    public function __construct(
        TranslatorInterface                   $translator,
        private readonly AttendanceRepository $attendanceRepository
    )
    {
        parent::__construct($translator);
    }

    /**
     * Get attendances by period and user.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    #[OA\Parameter(
        name: 'from',
        description: 'Start date of the period (YYYY-MM-DD)',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', format: 'date')
    )]
    #[OA\Parameter(
        name: 'to',
        description: 'End date of the period (YYYY-MM-DD)',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', format: 'date')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a list of attendances for the specified period and user.',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: Attendance::class, groups: ['attendance:read']))
        )
    )]
    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(Request $request): JsonResponse
    {
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth()->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth()->format('Y-m-d')));

        $attendances = $this->attendanceRepository->findByPeriodAndUser($from, $to, $this->getUser());;

        return $this->createAttendanceResponse($attendances);
    }
}
