<?php
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\AttendanceTrait;
use App\Controller\AbstractController;
use App\Entity\Attendance;
use App\Form\AttendanceFormType;
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

        $attendances = $this->attendanceRepository->findByPeriodAndUser($from, $to, $this->getUser());

        return $this->createAttendanceResponse($attendances);
    }

    /**
     * Create a new attendance.
     *
     * @param Request $request The request object containing the attendance data.
     *
     * @retrun JsonResponse
     */
    #[OA\Response(
        response: Response::HTTP_CREATED,
        description: 'Returns the created attendance.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Confirmation message after creation', type: 'string'),
                new OA\Property(property: 'attendance', ref: new Model(type: Attendance::class, groups: ['attendance:read'])),
            ],
            type: 'object'
        )
    )]
    #[Route(name: 'post', methods: ['POST'])]
    public function post(Request $request): JsonResponse
    {
        $attendance = $this->attendanceRepository->create();
        $form = $this->createForm(AttendanceFormType::class, $attendance);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $attendance->setUser($this->getUser());
            $this->attendanceRepository->update($attendance);

            return $this->createAttendanceResponse($attendance, Response::HTTP_CREATED);
        }

        return $this->createAttendanceResponse($attendance, Response::HTTP_CREATED);
    }

    /**
     * Get an attendance by its public ID.
     *
     * @param string $publicId The public ID of the attendance.
     *
     * @return JsonResponse
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'Public ID of the attendance to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns the attendance with the specified public ID.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'attendance', ref: new Model(type: Attendance::class, groups: ['attendance:read'])),
            ],
            type: 'object'
        )
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Attendance not found.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'error', description: 'Error message', type: 'string'),
            ],
            type: 'object'
        )
    )]
    #[Route('/{publicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId): JsonResponse
    {
        $attendance = $this->getAttendanceByPublicId($publicId);
        return $this->createAttendanceResponse($attendance);
    }

    /**
     * Delete an attendance.
     *
     * @param string $publicId The public ID of the attendance to delete.
     *
     * @return JsonResponse
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'Public ID of the attendance to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns no content after successful deletion.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Confirmation message after deletion', type: 'string'),
            ],
            type: 'object'
        )
    )]
    #[Route('/{publicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId): JsonResponse
    {
        $attendance = $this->getAttendanceByPublicId($publicId);
        $this->attendanceRepository->delete($attendance);

        return $this->createAttendanceResponse($this->translator->trans('deleted.attendance'));
    }
}
