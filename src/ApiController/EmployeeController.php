<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\AttendanceTrait;
use App\ApiController\Trait\EmployeeEvaluationTrait;
use App\ApiController\Trait\EmployeeTrait;
use App\ApiController\Trait\EvaluationTemplateTrait;
use App\Controller\AbstractController;
use App\DTO\AttendanceDTO;
use App\DTO\EmployeeDTO;
use App\DTO\EmployeeEvaluationDTO;
use App\Event\Employee\CheckEmployeeLimitEvent;
use App\Event\EmployeeEvaluation\FinalizeEmployeeEvaluationEvent;
use App\Form\AttendanceFormType;
use App\Form\EmployeeEvaluationFormType;
use App\Form\EmployeeFormType;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeEvaluationRepository;
use App\Repository\EmployeeRepository;
use App\Util\DateHelper;
use DateMalformedStringException;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Exception;
use OpenApi\Attributes as OA;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Contracts\Translation\TranslatorInterface;
use App\Entity\User;

/**
 * Class EmployeeController.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/employees', name: 'employees_')]
#[OA\Tag(name: 'Employees')]
class EmployeeController extends AbstractController
{
    use AttendanceTrait;
    use EmployeeTrait;
    use EmployeeEvaluationTrait;
    use EvaluationTemplateTrait;

    public function __construct(
        TranslatorInterface                           $translator,
        private readonly EventDispatcherInterface     $dispatcher,
        private readonly EmployeeRepository           $employeeRepository,
        private readonly EmployeeEvaluationRepository $employeeEvaluationRepository,
        private readonly AttendanceRepository         $attendanceRepository,
    )
    {
        parent::__construct($translator);
    }

    /**
     * Get employees by current user.
     *
     * @throws Exception
     */
    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(
        Request             $request,
        #[CurrentUser] User $user,
    ): JsonResponse
    {
        $employees = $this->employeeRepository->findByUser($user);
        $now = new DateTimeImmutable();
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth($now)->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth($now)->format('Y-m-d')));

        $listEmployees = [];
        foreach ($employees as $employee) {
            $listEmployees[$employee->id] = $employee;
        }

        $averageScoreMap = [];
        if (count($listEmployees) > 0) {
            $averageScores = $this->employeeEvaluationRepository->getAverageScoresForPeriod($employees, $from, $to);
            foreach ($averageScores as $averageScore) {
                $averageScoreMap[$averageScore['employeeId']] = (float)($averageScore['averageScore'] ?? 0);
            }
        }

        $dtos = [];
        foreach ($listEmployees as $employee) {
            $dto = EmployeeDTO::fromEntity($employee);
            $dto->averageScore = $averageScoreMap[$employee->id] ?? null;
            $dtos[] = $dto;
        }

        return $this->createEmployeeResponse($dtos);
    }

    /**
     * Create a new employee for the current user.
     */
    #[Route(name: 'post', methods: ['POST'])]
    public function post(Request $request): JsonResponse
    {
        $this->dispatcher->dispatch(new CheckEmployeeLimitEvent($this->getUser()));
        $employee = $this->employeeRepository->create();
        $form = $this->createForm(EmployeeFormType::class, $employee);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $user = $this->getUser();
            $employee->setUser($user);
            $employee->setWorkspace($user->getCurrentWorkspace());
            $this->employeeRepository->update($employee);

            return $this->createEmployeeResponse([
                'employee' => EmployeeDTO::fromEntity($employee),
                'message'  => $this->translator->trans('created.employee', ['%name%' => $employee], 'messages'),
            ], Response::HTTP_CREATED);
        }

        return $this->json(
            ['message' => $this->translator->trans('invalid.employee', domain: 'errors')],
            Response::HTTP_BAD_REQUEST
        );
    }

    /**
     * Get employee details by publicId.
     *
     * @throws Exception
     */
    #[Route('/{publicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $now = new DateTimeImmutable();
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth($now)->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth($now)->format('Y-m-d')));
        $averageScore = $this->employeeEvaluationRepository->getAverageScoreForPeriod($employee, $from, $to);

        $dto = EmployeeDTO::fromEntity($employee);
        $dto->averageScore = $averageScore;

        return $this->createEmployeeResponse($dto);
    }

    /**
     * Update employee details by publicId.
     */
    #[Route('/{publicId}', name: 'put', methods: ['PUT'])]
    public function put(Request $request, string $publicId): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $form = $this->createForm(EmployeeFormType::class, $employee);
        $form->submit($request->getPayload()->all(), false);
        if ($form->isSubmitted() && $form->isValid()) {
            $this->employeeRepository->update($employee);

            return $this->createEmployeeResponse(EmployeeDTO::fromEntity($employee));
        }

        return $this->json(
            ['message' => $this->translator->trans('invalid.employee', domain: 'errors')],
            Response::HTTP_BAD_REQUEST
        );
    }

    /**
     * Get attendances for the employee by publicId and period.
     *
     * @throws Exception
     */
    #[Route('/{publicId}/attendance', name: 'get_attendances', methods: ['GET'])]
    public function getAttendances(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth()->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth()->format('Y-m-d')));
        $attendances = $this->attendanceRepository->findByEmployeeAndPeriod($employee, $from, $to);

        return $this->createAttendanceResponse(AttendanceDTO::fromEntities($attendances));
    }

    /**
     * Post attendance for the employee by publicId.
     */
    #[Route('/{publicId}/attendance', name: 'post_attendance', methods: ['POST'])]
    public function postAttendance(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $attendance = $this->attendanceRepository->create();
        $form = $this->createForm(AttendanceFormType::class, $attendance);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $user = $this->getUser();
            $attendance->setEmployee($employee);
            $attendance->setUser($user);
            $attendance->setWorkspace($user->getCurrentWorkspace());
            $this->employeeRepository->update($attendance);

            return $this->createAttendanceResponse([
                'message'    => $this->translator->trans('created.attendance', ['%name%' => $employee], domain: 'messages'),
                'attendance' => AttendanceDTO::fromEntity($attendance),
            ], Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.attendance', domain: 'errors'));
    }

    /**
     * Delete employee by publicId.
     */
    #[Route('/{publicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $this->employeeRepository->delete($employee);

        return new JsonResponse([
            'message' => $this->translator->trans('deleted.employee', ['%name%' => $employee], domain: 'messages'),
        ], Response::HTTP_NO_CONTENT);
    }

    #[Route('/{publicId}/templates/{templatePublicId}', name: 'post_templates', methods: ['GET'])]
    public function postTemplate(string $publicId, string $templatePublicId): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $template = $this->getEvaluationTemplateByPublicId($templatePublicId);

        $employee->setTemplates(new ArrayCollection([$template]));

        return $this->createEmployeeResponse([
            'employee' => EmployeeDTO::fromEntity($employee),
            'message'  => $this->translator->trans('added.evaluation_template', ['%template%' => $template], 'messages'),
        ]);
    }

    /**
     * Post an evaluation for the employee by publicId.
     *
     * @throws DateMalformedStringException
     */
    #[Route('/{publicId}/evaluations', name: 'post_evaluations', methods: ['POST'])]
    public function postEvaluation(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $evaluation = $this->employeeEvaluationRepository->create();

        $form = $this->createForm(EmployeeEvaluationFormType::class, $evaluation);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $evaluation->setEmployee($employee);
            $evaluation->setEvaluator($this->getUser());

            $this->dispatcher->dispatch(new FinalizeEmployeeEvaluationEvent($evaluation));
            $this->employeeEvaluationRepository->update($evaluation);

            return $this->createEmployeeEvaluationResponse([
                'message'    => $this->translator->trans('created.employee_evaluation'),
                'evaluation' => EmployeeEvaluationDTO::fromEntity($evaluation, true),
            ], Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.employee_evaluation', domain: 'errors'));
    }

    /**
     * Get employee evaluation by publicId and date.
     *
     * @throws Exception
     */
    #[Route('/{publicId}/evaluation', name: 'get_evaluation', methods: ['GET'])]
    public function getEmployeeEvaluation(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $date = $request->query->get('date', (new DateTimeImmutable())->format('Y-m-d'));
        $evaluation = $this->employeeEvaluationRepository->findByEvaluatedAtAndEmployee(new DateTimeImmutable($date), $employee);

        return $this->createEmployeeEvaluationResponse(
            $evaluation ? EmployeeEvaluationDTO::fromEntity($evaluation, true) : null
        );
    }

    /**
     * Get all evaluations for the employee by publicId and period.
     *
     * @throws Exception
     */
    #[Route('/{publicId}/evaluations', name: 'get_evaluations', methods: ['GET'])]
    public function getEmployeeEvaluations(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $from = $request->query->get('from', (new DateTimeImmutable())->modify('-1 year')->format('Y-m-d'));
        $to = $request->query->get('to', (new DateTimeImmutable())->format('Y-m-d'));

        $evaluations = $this->employeeEvaluationRepository->findByPeriodAndEmployee(new DateTimeImmutable($from), new DateTimeImmutable($to), $employee);

        return $this->createEmployeeEvaluationResponse(EmployeeEvaluationDTO::fromEntities($evaluations, true));
    }

    /**
     * @throws Exception
     */
    #[Route('/{publicId}/evaluations/evaluations/average-score', name: 'get_evaluation_by_id', methods: ['GET'])]
    public function getAverageScore(string $publicId, Request $request): JsonResponse
    {
        $now = new DateTimeImmutable();
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth($now)->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth($now)->format('Y-m-d')));
        $employee = $this->getEmployeeByPublicId($publicId);
        $average = $this->employeeEvaluationRepository->getAverageScoreForPeriod($employee, $from, $to);

        return $this->json(['averageScore' => $average]);
    }
}
