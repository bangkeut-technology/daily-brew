<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EmployeeEvaluationTrait;
use App\ApiController\Trait\EmployeeTrait;
use App\ApiController\Trait\EvaluationTemplateTrait;
use App\Controller\AbstractController;
use App\Entity\EmployeeEvaluation;
use App\Entity\User;
use App\Event\Employee\CheckEmployeeLimitEvent;
use App\Event\EmployeeEvaluation\FinalizeEmployeeEvaluationEvent;
use App\Form\EmployeeEvaluationFormType;
use App\Form\EmployeeFormType;
use App\Repository\EmployeeEvaluationRepository;
use App\Repository\EmployeeRepository;
use App\Util\DateHelper;
use Doctrine\Common\Collections\ArrayCollection;
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
    use EmployeeTrait;
    use EmployeeEvaluationTrait;
    use EvaluationTemplateTrait;

    public function __construct(
        TranslatorInterface $translator,
        private readonly EventDispatcherInterface $dispatcher,
        private readonly EmployeeRepository $employeeRepository,
        private readonly EmployeeEvaluationRepository $employeeEvaluationRepository,
    ) {
        parent::__construct($translator);
    }

    /**
     * Get employees by current user.
     *
     * @throws \Exception
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
        Request $request,
        #[CurrentUser] User $user,
    ): JsonResponse {
        $employees = $this->employeeRepository->findByUser($user);
        $now = new \DateTimeImmutable();
        $from = new \DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth($now)->format('Y-m-d')));
        $to = new \DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth($now)->format('Y-m-d')));
        $listEmployees = [];
        foreach ($employees as $employee) {
            $listEmployees[$employee->getId()] = $employee;
        }
        if (count($listEmployees) > 0) {
            $averageScores = $this->employeeEvaluationRepository->getAverageScoresForPeriod($employees, $from, $to);
            foreach ($averageScores as $averageScore) {
                if (null !== $listEmployees[$averageScore['employeeId']]) {
                    $listEmployees[$averageScore['employeeId']]->averageScore = (float) ($averageScore['averageScore'] ?? 0);
                }
            }
        }

        return $this->createEmployeeResponse(array_values($listEmployees));
    }

    /**
     * Create a new employee for the current user.
     *
     * @throws RandomException
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
        #[CurrentUser] User $user,
    ): JsonResponse {
        $this->dispatcher->dispatch(new CheckEmployeeLimitEvent($this->getUser()));
        $employee = $this->employeeRepository->create();
        $form = $this->createForm(EmployeeFormType::class, $employee);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $employee->setUser($user);
            $this->employeeRepository->updateEmployee($employee);

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
     * Get employee details by identifier.
     *
     * @param string $identifier The unique identifier of the employee
     *
     * @throws \Exception
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The unique identifier of the employee',
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
        description: 'Returns employee details by identifier',
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
    #[Route('/{identifier}', name: 'get', methods: ['GET'])]
    public function get(string $identifier, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByIdentifier($identifier);
        $now = new \DateTimeImmutable();
        $from = new \DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth($now)->format('Y-m-d')));
        $to = new \DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth($now)->format('Y-m-d')));
        $employee->averageScore = $this->employeeEvaluationRepository->getAverageScoreForPeriod($employee, $from, $to);

        return $this->createEmployeeResponse($employee);
    }

    /**
     * Update employee details by identifier.
     *
     * @param string $identifier The unique identifier of the employee
     *
     * @throws RandomException
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The unique identifier of the employee',
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
        description: 'Updates employee details by identifier',
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
    #[Route('/{identifier}', name: 'put', methods: ['PUT'])]
    public function put(Request $request, string $identifier): JsonResponse
    {
        $employee = $this->getEmployeeByIdentifier($identifier);
        $form = $this->createForm(EmployeeFormType::class, $employee);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $this->employeeRepository->updateEmployee($employee);

            return $this->createEmployeeResponse($employee);
        }

        return $this->json(
            ['message' => $this->translator->trans('invalid.employee', domain: 'errors')],
            Response::HTTP_BAD_REQUEST
        );
    }

    /**
     * Delete employee by identifier.
     *
     * @param string $identifier The unique identifier of the employee
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The unique identifier of the employee',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string', example: 'emp123')
    )]
    #[OA\Response(
        response: Response::HTTP_NO_CONTENT,
        description: 'Deletes employee by identifier'
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
    #[Route('/{identifier}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $identifier): JsonResponse
    {
        $employee = $this->getEmployeeByIdentifier($identifier);
        $this->employeeRepository->delete($employee);

        return new JsonResponse([
            'message' => $this->translator->trans('deleted.employee', ['%name%' => $employee], domain: 'messages'),
        ], Response::HTTP_NO_CONTENT);
    }

    #[Route('/{identifier}/templates/{templateIdentifier}', name: 'post_templates', methods: ['GET'])]
    public function postTemplate(string $identifier, string $templateIdentifier): JsonResponse
    {
        $employee = $this->getEmployeeByIdentifier($identifier);
        $template = $this->getEvaluationTemplateByIdentifier($templateIdentifier);

        $employee->setTemplates(new ArrayCollection([$template]));

        return $this->createTemplateResponse([
            'employee' => $employee,
            $this->translator->trans('added.evaluation_template', ['%template%' => $template], 'messages'),
        ]);
    }

    /**
     * Post an evaluation for the employee by identifier.
     *
     * @param string  $identifier The unique identifier of the employee
     * @param Request $request    The HTTP request containing the evaluation data
     *
     * @throws RandomException
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The unique identifier of the employee',
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
    #[Route('/{identifier}/evaluations', name: 'post_evaluations', methods: ['POST'])]
    public function postEvaluation(string $identifier, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByIdentifier($identifier);
        if (null === $evaluation = $this->employeeEvaluationRepository->findByDateAndEmployee(new \DateTimeImmutable(), $employee)) {
            $evaluation = $this->employeeEvaluationRepository->create();
        }

        $form = $this->createForm(EmployeeEvaluationFormType::class, $evaluation);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $evaluation->setEmployee($employee);
            $evaluation->setEvaluator($this->getUser());

            $this->dispatcher->dispatch(new FinalizeEmployeeEvaluationEvent($evaluation));

            $this->employeeEvaluationRepository->updateEmployeeEvaluation($evaluation);

            return $this->createEmployeeEvaluationResponse([
                'message' => $this->translator->trans('created.employee_evaluation'),
                'evaluation' => $evaluation,
            ], Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.employee_evaluation', domain: 'errors'));
    }

    /**
     * Get employee evaluation by identifier and date.
     *
     * @param string  $identifier The unique identifier of the employee
     * @param Request $request    The HTTP request containing the date parameter
     *
     * @throws \Exception
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The unique identifier of the employee',
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
    #[Route('/{identifier}/evaluation', name: 'get_evaluation', methods: ['GET'])]
    public function getEmployeeEvaluation(string $identifier, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByIdentifier($identifier);
        $date = $request->query->get('date', (new \DateTimeImmutable())->format('Y-m-d'));
        $evaluation = $this->employeeEvaluationRepository->findByDateAndEmployee(new \DateTimeImmutable($date), $employee);

        return $this->createEmployeeEvaluationResponse($evaluation);
    }

    /**
     * Get all evaluations for the employee by identifier and period.
     *
     * @param string  $identifier The unique identifier of the employee
     * @param Request $request    The HTTP request
     *
     * @throws \Exception
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The unique identifier of the employee',
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
    #[Route('/{identifier}/evaluations', name: 'get_evaluations', methods: ['GET'])]
    public function getEmployeeEvaluations(string $identifier, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByIdentifier($identifier);
        $from = $request->query->get('from', (new \DateTimeImmutable())->modify('-1 year')->format('Y-m-d'));
        $to = $request->query->get('to', (new \DateTimeImmutable())->format('Y-m-d'));

        $evaluations = $this->employeeEvaluationRepository->findByPeriodAndEmployee(new \DateTimeImmutable($from), new \DateTimeImmutable($to), $employee);

        return $this->createEmployeeEvaluationResponse($evaluations);
    }

    /**
     * @throws \Exception
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The unique identifier of the employee',
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
    #[Route('/{identifier}/evaluations/evaluations/average-score', name: 'get_evaluation_by_id', methods: ['GET'])]
    public function getAverageScore(string $identifier, Request $request): JsonResponse
    {
        $now = new \DateTimeImmutable();
        $from = new \DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth($now)->format('Y-m-d')));
        $to = new \DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth($now)->format('Y-m-d')));
        $employee = $this->getEmployeeByIdentifier($identifier);
        $average = $this->employeeEvaluationRepository->getAverageScoreForPeriod($employee, $from, $to);

        return $this->json(['averageScore' => $average]);
    }
}
