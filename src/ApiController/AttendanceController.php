<?php
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\AttendanceTrait;
use App\Controller\AbstractController;
use App\DTO\AttendanceDTO;
use App\DTO\EmployeeDTO;
use App\Entity\Attendance;
use App\Entity\Employee;
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
    #[OA\Parameter(
        name: 'employee',
        description: 'The employee to filter attendances by',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name:'status',
        description: 'The status of the attendance',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'user',
        description: 'The user to filter attendances by',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
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
        $employee = $request->query->get('employee');
        $status = $request->query->get('status');
        $user = $request->query->get('user');

        $criteria = [
            'from' => $from,
            'to' => $to,
            'employee' => $employee,
            'status' => $status,
            'user' => $user ?: $this->getUser()->getPublicId(),
        ];

        $attendances = $this->attendanceRepository->findByCriteria($criteria);

        return $this->createAttendanceResponse($attendances);
    }

    /**
     * Get attendances by period and user.
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
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
    #[OA\Parameter(
        name: 'employees',
        description: 'The employees to filter attendances by',
        in: 'query',
        required: true,
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a list of attendances for the specified period and user.',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: Attendance::class, groups: ['attendance:read']))
        )
    )]
    #[Route('/gantt', name: 'gantt', methods: ['GET'])]
    public function gantt(Request $request): JsonResponse
    {
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth()->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth()->format('Y-m-d')));
        $employees = $request->query->all('employees');

        if (empty($employees)) {
            return $this->createBadRequestResponse($this->translator->trans('invalid.employees', domain: 'errors'));
        }

        $attendances = $this->attendanceRepository->findForGantt([
            'from' => $from,
            'to' => $to,
            'employees' => $employees,
            'user' => $this->getUser()->getPublicId(),
        ]);

        $employees = [];
        foreach ($attendances as $attendance) {
            $employee = $attendance->getEmployee();
            $employeePublicId = $employee->getPublicId();
            $date = $attendance->getAttendanceDate()->format('Y-m-d');

            if (!isset($employees[$employeePublicId])) {
                $employees[$employeePublicId] = EmployeeDTO::fromEntity($employee, true);
            }

            $employees[$employeePublicId]->attendances[$date] = AttendanceDTO::fromEntity($attendance, false);
        }

        return $this->json($employees);
    }

    /**
     * Create a new attendance.
     *
     * @param Request $request The request object containing the attendance data.
     *
     * @retrun JsonResponse
     */
    #[OA\RequestBody(
        description: 'Attendance data to create',
        content: new OA\JsonContent(
            ref: new Model(type: AttendanceFormType::class),
        )
    )]
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
     * Update an existing attendance.
     *
     * @param string  $publicId The public ID of the attendance to update.
     * @param Request $request  The request object containing the updated attendance data.
     *
     * @return JsonResponse
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'Public ID of the attendance to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\RequestBody(
        description: 'Updated attendance data',
        content: new OA\JsonContent(
            ref: new Model(type: AttendanceFormType::class),
        )
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns the updated attendance.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Confirmation message after update', type: 'string'),
                new OA\Property(property: 'attendance', ref: new Model(type: Attendance::class, groups: ['attendance:read'])),
            ],
            type: 'object'
        )
    )]
    #[OA\Response(
        response: Response::HTTP_BAD_REQUEST,
        description: 'Invalid attendance data.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'error', description: 'Error message', type: 'string'),
            ],
            type: 'object'
        )
    )]
    #[Route('/{publicId}', name: 'put', methods: ['PUT'])]
    public function put(string $publicId, Request $request): JsonResponse
    {
        $attendance = $this->getAttendanceByPublicId($publicId);
        $form = $this->createForm(AttendanceFormType::class, $attendance);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $this->attendanceRepository->update($attendance);

            return $this->createAttendanceResponse(['attendance' => $attendance, 'message' => $this->translator->trans('updated.attendance')]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.attendance', domain: 'errors'));

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
