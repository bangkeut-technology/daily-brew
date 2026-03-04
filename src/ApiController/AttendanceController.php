<?php
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\AttendanceTrait;
use App\Controller\AbstractController;
use App\DTO\AttendanceDTO;
use App\DTO\EmployeeDTO;
use App\Enum\AttendanceTypeEnum;
use App\Form\AttendanceFormType;
use App\Repository\AttendanceRepository;
use App\Repository\WorkspaceAllowedIpRepository;
use App\Util\DateHelper;
use DateMalformedStringException;
use DateTimeImmutable;
use Exception;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Psr\EventDispatcher\EventDispatcherInterface;
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
        TranslatorInterface                            $translator,
        private readonly AttendanceRepository          $attendanceRepository,
        private readonly WorkspaceAllowedIpRepository  $allowedIpRepository,
        private readonly EventDispatcherInterface      $eventDispatcher
    )
    {
        parent::__construct($translator);
    }

    /**
     * Get attendances by period and user.
     *
     * @throws Exception
     */
    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(Request $request): JsonResponse
    {
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth()->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth()->format('Y-m-d')));
        $employee = $request->query->get('employee');
        $type = $request->query->get('type');
        $user = $request->query->get('user');

        $criteria = [
            'from' => $from,
            'to' => $to,
            'employee' => $employee,
            'type' => $type,
            'user' => $user ?: $this->getUser()->publicId,
        ];

        $attendances = $this->attendanceRepository->findByCriteria($criteria);

        return $this->createAttendanceResponse(AttendanceDTO::fromEntities($attendances));
    }

    /**
     * Get attendances for Gantt chart view.
     *
     * @throws Exception
     */
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
            'user' => $this->getUser()->publicId,
        ]);

        $employeeDTOs = [];
        foreach ($attendances as $attendance) {
            $employee = $attendance->getEmployee();
            $employeePublicId = $employee->publicId;
            $date = $attendance->getAttendanceDate()->format('Y-m-d');

            if (!isset($employeeDTOs[$employeePublicId])) {
                $employeeDTOs[$employeePublicId] = EmployeeDTO::fromEntity($employee, true);
            }

            $employeeDTOs[$employeePublicId]->attendances[$date] = AttendanceDTO::fromEntity($attendance, false);
        }

        return $this->json($employeeDTOs);
    }

    /**
     * Create a new attendance.
     */
    #[Route(name: 'post', methods: ['POST'])]
    public function post(Request $request): JsonResponse
    {
        $attendance = $this->attendanceRepository->create();
        $form = $this->createForm(AttendanceFormType::class, $attendance);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $user  = $this->getUser();
            $workspace = $user->getCurrentWorkspace();
            $attendance->setUser($user);
            $attendance->setWorkspace($workspace);

            if (null !== $workspace) {
                $activeIps = $this->allowedIpRepository->findActiveByWorkspace($workspace);
                if (!empty($activeIps)) {
                    $clientIp = $request->getClientIp();
                    $allowed = array_filter($activeIps, fn($entry) => $entry->getIp() === $clientIp);
                    if (empty($allowed)) {
                        return $this->json(
                            ['message' => $this->translator->trans('attendance.ip_not_allowed', domain: 'errors')],
                            Response::HTTP_FORBIDDEN
                        );
                    }
                }
            }

            $exists = $this->attendanceRepository->existsForEmployeeOnDay($attendance->getEmployee(), $attendance->getAttendanceDate());
            if ($exists) {
                return $this->json(
                    ['message' => $this->translator->trans('attendance.duplicate_for_day', ['%date%' => $attendance->getAttendanceDate()->format('Y-m-d')], domain: 'errors')],
                    Response::HTTP_CONFLICT
                );
            }

            $this->attendanceRepository->update($attendance);

            return $this->createAttendanceResponse([
                'message'    => $this->translator->trans('created.attendance'),
                'attendance' => AttendanceDTO::fromEntity($attendance),
            ], Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.attendance', domain: 'errors'));
    }

    /**
     * Retrieve upcoming attendances within the next 14 days.
     *
     * @throws DateMalformedStringException
     */
    #[Route('/upcoming', name: 'upcoming', methods: ['GET'])]
    public function upcoming(Request $request): JsonResponse
    {
        $employeePublicId = $request->query->get('employeePublicId');
        $type = $request->query->get('type');

        $from = new DateTimeImmutable('today 00:00:00');
        $to = $from->modify('+14 days')->setTime(23, 59, 59);

        $attendances = $this->attendanceRepository->findUpcomingByType(
            user: $this->getUser(),
            from: $from,
            to: $to,
            type: $type ? AttendanceTypeEnum::from($type) : null,
            employeePublicId: $employeePublicId
        );

        return $this->createAttendanceResponse(AttendanceDTO::fromEntities($attendances));
    }

    /**
     * Get an attendance by its public ID.
     */
    #[Route('/{publicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId): JsonResponse
    {
        $attendance = $this->getAttendanceByPublicId($publicId);

        return $this->createAttendanceResponse(AttendanceDTO::fromEntity($attendance));
    }

    /**
     * Update an existing attendance.
     */
    #[Route('/{publicId}', name: 'put', methods: ['PUT'])]
    public function put(string $publicId, Request $request): JsonResponse
    {
        $attendance = $this->getAttendanceByPublicId($publicId);
        $form = $this->createForm(AttendanceFormType::class, $attendance);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $this->attendanceRepository->update($attendance);

            return $this->createAttendanceResponse([
                'attendance' => AttendanceDTO::fromEntity($attendance),
                'message'    => $this->translator->trans('updated.attendance'),
            ]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.attendance', domain: 'errors'));
    }

    /**
     * Delete an attendance.
     */
    #[Route('/{publicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId): JsonResponse
    {
        $attendance = $this->getAttendanceByPublicId($publicId);
        $this->attendanceRepository->delete($attendance);

        return $this->json(['message' => $this->translator->trans('deleted.attendance')]);
    }
}
