<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\AttendanceTrait;
use App\ApiController\Trait\EmployeeEvaluationTrait;
use App\ApiController\Trait\EmployeeTrait;
use App\ApiController\Trait\EvaluationTemplateTrait;
use App\Controller\AbstractController;
use App\Entity\Attendance;
use App\Entity\EmployeeEvaluation;
use App\Entity\User;
use App\Event\Employee\CheckEmployeeLimitEvent;
use App\Event\EmployeeEvaluation\FinalizeEmployeeEvaluationEvent;
use App\Form\AttendanceFormType;
use App\Form\EmployeeEvaluationFormType;
use App\Form\EmployeeFormType;
use App\Repository\AttendanceRepository;
use App\Repository\EmployeeEvaluationRepository;
use App\Repository\EmployeeRepository;
use App\Util\DateHelper;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Exception;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Random\RandomException;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Contracts\Translation\TranslatorInterface;

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
        private readonly EmployeeEvaluationRepository $employeeEvaluationRepository, private readonly AttendanceRepository $attendanceRepository,
    )
    {
        parent::__construct($translator);
    }

    /**
     * Get employees by current user.
     *
     * @throws Exception
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a list of employees for the current user',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: User::class, groups: ['employee:read']))
        )
    )]
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
            $listEmployees[$employee->getId()] = $employee;
        }
        if (count($listEmployees) > 0) {
            $averageScores = $this->employeeEvaluationRepository->getAverageScoresForPeriod($employees, $from, $to);
            foreach ($averageScores as $averageScore) {
                if (null !== $listEmployees[$averageScore['employeeId']]) {
                    $listEmployees[$averageScore['employeeId']]->averageScore = (float)($averageScore['averageScore'] ?? 0);
                }
            }
        }

        return $this->createEmployeeResponse(array_values($listEmployees));
    }

    /**
     * Create a new employee for the current user.
     *
     * @param Request $request The request object containing the employee data.
     *
     * @return JsonResponse The JSON response containing the created employee data or an error message.
     */
    #[OA\RequestBody(
        description: 'Employee data',
        content: new OA\JsonContent(
            ref: new Model(type: EmployeeFormType::class),
        )
    )]
    #[OA\Response(
        response: Response::HTTP_CREATED,
        description: 'Creates a new employee for the current user',
        content: new OA\JsonContent(ref: new Model(type: User::class, groups: ['employee:read']))
    )]
    #[OA\Response(
        response: Response::HTTP_BAD_REQUEST,
        description: 'Invalid input data',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'message',
                    type: 'string',
                    example: 'Invalid input data'
                ),
            ],
            type: 'object'
        )
    )]
    #[Route(name: 'post', methods: ['POST'])]
    public function post(
        Request $request,
    ): JsonResponse
    {
        $this->dispatcher->dispatch(new CheckEmployeeLimitEvent($this->getUser()));
        $employee = $this->employeeRepository->create();
        $form = $this->createForm(EmployeeFormType::class, $employee);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $employee->setUser($this->getUser());
            $this->employeeRepository->update($employee);

            return $this->createEmployeeResponse([
                'employee' => $employee,
                'message' => $this->translator->trans('created.employee', ['%name%' => $employee], 'messages'),
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
     * @param string $publicId The unique publicId of the employee
     *
     * @throws Exception
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The unique publicId of the employee',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string', example: 'emp123')
    )]
    #[OA\Parameter(
        name: 'from',
        description: 'The start date of the evaluation period in YYYY-MM-DD format',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', example: '2023-01-01')
    )]
    #[OA\Parameter(
        name: 'to',
        description: 'The end date of the evaluation period in YYYY-MM-DD format',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', example: '2023-12-31')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns employee details by publicId',
        content: new OA\JsonContent(ref: new Model(type: User::class, groups: ['employee:read', 'user:read', 'store:read', 'role:read']))
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Employee not found',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'message',
                    type: 'string',
                    example: 'Employee not found'
                ),
            ],
            type: 'object'
        )
    )]
    #[Route('/{publicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $now = new DateTimeImmutable();
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth($now)->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth($now)->format('Y-m-d')));
        $employee->averageScore = $this->employeeEvaluationRepository->getAverageScoreForPeriod($employee, $from, $to);

        return $this->createEmployeeResponse($employee);
    }

    /**
     * Update employee details by publicId.
     *
     * @param string $publicId The unique publicId of the employee
     *
     * @throws RandomException
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The unique publicId of the employee',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string', example: 'emp123')
    )]
    #[OA\RequestBody(
        description: 'Employee data',
        content: new OA\JsonContent(
            ref: new Model(type: EmployeeFormType::class),
        )
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Updates employee details by publicId',
        content: new OA\JsonContent(ref: new Model(type: User::class, groups: ['employee:read']))
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Employee not found',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'message',
                    type: 'string',
                    example: 'Employee not found'
                ),
            ],
            type: 'object'
        )
    )]
    #[OA\Response(
        response: Response::HTTP_BAD_REQUEST,
        description: 'Invalid input data',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'message',
                    type: 'string',
                    example: 'Invalid input data'
                ),
            ],
            type: 'object'
        )
    )]
    #[Route('/{publicId}', name: 'put', methods: ['PUT'])]
    public function put(Request $request, string $publicId): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $form = $this->createForm(EmployeeFormType::class, $employee);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $this->employeeRepository->update($employee);

            return $this->createEmployeeResponse($employee);
        }

        return $this->json(
            ['message' => $this->translator->trans('invalid.employee', domain: 'errors')],
            Response::HTTP_BAD_REQUEST
        );
    }

    /**
     * Get attendances for the employee by publicId and period.
     *
     * @param string  $publicId The unique publicId of the employee
     * @param Request $request  The HTTP request
     *
     * @throws Exception
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The unique publicId of the employee',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string', example: 'emp123')
    )]
    #[OA\Parameter(
        name: 'from',
        description: 'The start date of the attendance period in YYYY-MM-DD format',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', example: '2023-01-01')
    )]
    #[OA\Parameter(
        name: 'to',
        description: 'The end date of the attendance period in YYYY-MM-DD format',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', example: '2023-12-31')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns all attendances for the employee',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: Attendance::class, groups: ['attendance:read']))
        )
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Employee not found',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'message',
                    type: 'string',
                    example: 'Employee not found'
                ),
            ],
            type: 'object'
        )
    )]
    #[Route('/{publicId}/attendance', name: 'get_attendances', methods: ['GET'])]
    public function getAttendances(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth()->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth()->format('Y-m-d')));
        $attendances = $this->attendanceRepository->findByEmployeeAndPeriod($employee, $from, $to);

        return $this->createAttendanceResponse($attendances);
    }

    /**
     * Post attendance for the employee by publicId.
     *
     * @param string  $publicId The unique publicId of the employee
     * @param Request $request  The HTTP request containing the attendance data
     *
     * @return JsonResponse The JSON response containing the created attendance data or an error message
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The unique publicId of the employee',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string', example: 'emp123')
    )]
    #[OA\RequestBody(
        description: 'Attendance data',
        content: new OA\JsonContent(
            ref: new Model(type: AttendanceFormType::class),
        )
    )]
    #[OA\Response(
        response: Response::HTTP_CREATED,
        description: 'Creates a new attendance for the employee',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'message',
                    type: 'string',
                    example: 'Attendance created successfully'
                ),
                new OA\Property(
                    property: 'attendance',
                    ref: new Model(type: Attendance::class, groups: ['attendance:read'])
                ),
            ],
            type: 'object'
        )
    )]
    #[OA\Response(
        response: Response::HTTP_BAD_REQUEST,
        description: 'Invalid input data',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'message',
                    type: 'string',
                    example: 'Invalid input data'
                ),
            ],
            type: 'object'
        )
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Employee not found',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'message',
                    type: 'string',
                    example: 'Employee not found'
                ),
            ],
            type: 'object'
        )
    )]
    #[Route('/{publicId}/attendance', name: 'post_attendance', methods: ['POST'])]
    public function postAttendance(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $attendance = $this->attendanceRepository->create();
        $form = $this->createForm(AttendanceFormType::class, $attendance);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $attendance->setEmployee($employee);
            $attendance->setUser($this->getUser());
            $this->employeeRepository->update($attendance);

            return $this->createAttendanceResponse([
                'message' => $this->translator->trans('created.attendance', ['%name%' => $employee], domain: 'messages'),
                'attendance' => $attendance,
            ], Response::HTTP_CREATED);
        }
        return $this->createBadRequestResponse($this->translator->trans('invalid.attendance', domain: 'errors'));
    }

    /**
     * Delete employee by publicId.
     *
     * @param string $publicId The unique publicId of the employee
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The unique publicId of the employee',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string', example: 'emp123')
    )]
    #[OA\Response(
        response: Response::HTTP_NO_CONTENT,
        description: 'Deletes employee by publicId'
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Employee not found',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'message',
                    type: 'string',
                    example: 'Employee not found'
                ),
            ],
            type: 'object'
        )
    )]
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

        return $this->createTemplateResponse([
            'employee' => $employee,
            $this->translator->trans('added.evaluation_template', ['%template%' => $template], 'messages'),
        ]);
    }

    /**
     * Post an evaluation for the employee by publicId.
     *
     * @param string  $publicId The unique publicId of the employee
     * @param Request $request  The HTTP request containing the evaluation data
     *
     * @return JsonResponse The JSON response containing the created evaluation data or an error message
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The unique publicId of the employee',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string', example: 'emp123')
    )]
    #[OA\RequestBody(
        description: 'Evaluation data',
        content: new OA\JsonContent(
            ref: new Model(type: EmployeeEvaluationFormType::class),
        )
    )]
    #[OA\Response(
        response: Response::HTTP_CREATED,
        description: 'Creates a new evaluation for the employee',
        content: new OA\JsonContent(ref: new Model(
            type: EmployeeEvaluation::class,
            groups: ['employee_evaluation:read', 'employee_criteria:read', 'employee:read', 'user:read', 'store:read', 'role:read', 'template:read']
        ))
    )]
    #[OA\Response(
        response: Response::HTTP_BAD_REQUEST,
        description: 'Invalid input data',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'message',
                    type: 'string',
                    example: 'Invalid input data'
                ),
            ],
            type: 'object'
        )
    )]
    #[Route('/{publicId}/evaluations', name: 'post_evaluations', methods: ['POST'])]
    public function postEvaluation(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        if (null === $evaluation = $this->employeeEvaluationRepository->findByDateAndEmployee(new DateTimeImmutable(), $employee)) {
            $evaluation = $this->employeeEvaluationRepository->create();
        }

        $form = $this->createForm(EmployeeEvaluationFormType::class, $evaluation);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $evaluation->setEmployee($employee);
            $evaluation->setEvaluator($this->getUser());

            $this->dispatcher->dispatch(new FinalizeEmployeeEvaluationEvent($evaluation));

            $this->employeeEvaluationRepository->update($evaluation);

            return $this->createEmployeeEvaluationResponse([
                'message' => $this->translator->trans('created.employee_evaluation'),
                'evaluation' => $evaluation,
            ], Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.employee_evaluation', domain: 'errors'));
    }

    /**
     * Get employee evaluation by publicId and date.
     *
     * @param string  $publicId The unique publicId of the employee
     * @param Request $request  The HTTP request containing the date parameter
     *
     * @throws Exception
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The unique publicId of the employee',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string', example: 'emp123')
    )]
    #[OA\Parameter(
        name: 'date',
        description: 'The date of the evaluation in YYYY-MM-DD format',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', example: '2023-10-01')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns the employee evaluation for the specified date',
        content: new OA\JsonContent(ref: new Model(type: EmployeeEvaluation::class, groups: ['employee_evaluation:read', 'employee_criteria:read', 'employee:read', 'user:read', 'store:read', 'role:read', 'template:read']))
    )]
    #[Route('/{publicId}/evaluation', name: 'get_evaluation', methods: ['GET'])]
    public function getEmployeeEvaluation(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $date = $request->query->get('date', (new DateTimeImmutable())->format('Y-m-d'));
        $evaluation = $this->employeeEvaluationRepository->findByDateAndEmployee(new DateTimeImmutable($date), $employee);

        return $this->createEmployeeEvaluationResponse($evaluation);
    }

    /**
     * Get all evaluations for the employee by publicId and period.
     *
     * @param string  $publicId The unique publicId of the employee
     * @param Request $request  The HTTP request
     *
     * @throws Exception
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The unique publicId of the employee',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string', example: 'emp123')
    )]
    #[OA\Parameter(
        name: 'from',
        description: 'The start date of the evaluation period in YYYY-MM-DD format',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', example: '2023-01-01')
    )]
    #[OA\Parameter(
        name: 'to',
        description: 'The end date of the evaluation period in YYYY-MM-DD format',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', example: '2023-12-31')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns all evaluations for the employee',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: EmployeeEvaluation::class, groups: ['employee_evaluation:read', 'employee_criteria:read', 'employee:read', 'user:read', 'store:read', 'role:read', 'template:read']))
        )
    )]
    #[Route('/{publicId}/evaluations', name: 'get_evaluations', methods: ['GET'])]
    public function getEmployeeEvaluations(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $from = $request->query->get('from', (new DateTimeImmutable())->modify('-1 year')->format('Y-m-d'));
        $to = $request->query->get('to', (new DateTimeImmutable())->format('Y-m-d'));

        $evaluations = $this->employeeEvaluationRepository->findByPeriodAndEmployee(new DateTimeImmutable($from), new DateTimeImmutable($to), $employee);

        return $this->createEmployeeEvaluationResponse($evaluations);
    }

    /**
     * @throws Exception
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The unique publicId of the employee',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string', example: 'emp123')
    )]
    #[OA\Parameter(
        name: 'from',
        description: 'The start date of the evaluation period in YYYY-MM-DD format',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', example: '2023-01-01')
    )]
    #[OA\Parameter(
        name: 'to',
        description: 'The end date of the evaluation period in YYYY-MM-DD format',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', example: '2023-12-31')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns the average score of evaluations for the employee',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'averageScore', type: 'number', format: 'float', example: 85.5),
            ],
            type: 'object'
        )
    )]
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
