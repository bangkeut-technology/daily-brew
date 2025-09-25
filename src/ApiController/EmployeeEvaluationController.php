<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\AttendanceTrait;
use App\ApiController\Trait\EmployeeEvaluationTrait;
use App\ApiController\Trait\EmployeeTrait;
use App\ApiController\Trait\EvaluationTemplateTrait;
use App\Controller\AbstractController;
use App\DTO\EmployeeEvaluationDTO;
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
use DateMalformedStringException;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Exception;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
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
#[Route('/employee-evaluations', name: 'employee_evaluations_')]
#[OA\Tag(name: 'Employee Evaluations')]
class EmployeeEvaluationController extends AbstractController
{
    use AttendanceTrait;
    use EmployeeTrait;
    use EmployeeEvaluationTrait;
    use EvaluationTemplateTrait;

    public function __construct(
        TranslatorInterface                           $translator,
        private readonly EventDispatcherInterface     $dispatcher,
        private readonly EmployeeEvaluationRepository $employeeEvaluationRepository,
    )
    {
        parent::__construct($translator);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     * @throws DateMalformedStringException
     */
    #[OA\Parameter(
        name: 'from',
        description: 'Start date of the period (YYYY-MM-DD)',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'to',
        description: 'End date of the period (YYYY-MM-DD)',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'employee',
        description: 'The employee to filter evaluations by',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'template',
        description: 'The evaluation template to filter evaluations by',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a list of evaluations for the specified period and user.',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: EmployeeEvaluation::class, groups: ['employee_evaluation:read']))
        )
    )]
    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(Request $request): JsonResponse
    {
        $criteria['user'] = $this->getUser();
        $criteria['employee'] = $request->query->get('employee') ?: null;
        $criteria['template'] = $request->query->get('template') ?: null;
        $from = $request->query->get('from');
        $to = $request->query->get('to');
        $criteria['from'] = $from ? new DateTimeImmutable($from) : null;
        $criteria['to'] = $to ? new DateTimeImmutable($to) : null;

        return $this->createEmployeeEvaluationResponse($this->employeeEvaluationRepository->findByCriteria($criteria));
    }

    /**
     * @param Request $request
     * @return JsonResponse
     * @throws DateMalformedStringException
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
        $employees = $request->query->all('employees');
        $from = new DateTimeImmutable($request->query->get('from', DateHelper::startOfMonth()->format('Y-m-d')));
        $to = new DateTimeImmutable($request->query->get('to', DateHelper::endOfMonth()->format('Y-m-d')));

        if (empty($employees)) {
            return $this->createBadRequestResponse($this->translator->trans('invalid.employees', domain: 'errors'));
        }

        $evaluations = $this->employeeEvaluationRepository->findForGantt(
            user: $this->getUser(),
            employees: $employees,
            from: $from,
            to: $to
        );
        $data = [];
        foreach ($evaluations as $evaluation) {
            $employee = $evaluation->getEmployee();
            $employeePublicId = $employee->publicId;
            $date = $evaluation->getEvaluatedAt()->format('Y-m-d');
            $data[$employeePublicId][$date] = EmployeeEvaluationDTO::fromEntity($evaluation, true);
        }

        return $this->json($data);
    }

    /**
     * Retrieves a list of recent employee evaluations based on the given limit.
     *
     * Accepts a query parameter 'limit,' which defines the maximum number of evaluations
     * to fetch. Defaults to 10 if not specified. Returns a response containing an array
     * of recent employee evaluations associated with the authenticated evaluator.
     *
     * @param Request $request The HTTP request containing the query parameters.
     * @return JsonResponse A JSON response containing the list of recent evaluations.
     * @throws Exception
     */
    #[OA\Parameter(
        name: 'limit',
        description: 'Maximum number of evaluations to fetch (default: 10)',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer', default: 10)
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'List of recent evaluations',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: EmployeeEvaluation::class, groups: ['employee_evaluation:read'])),
        )
    )]
    #[Route('/recents', name: 'recents', methods: ['GET'])]
    public function recent(
        Request $request,
    ): JsonResponse
    {
        $limit = $request->query->getInt('limit', 10);
        $user = $this->getUser();
        return $this->createEmployeeEvaluationResponse($this->employeeEvaluationRepository->findRecentByEvaluator($user, $limit));
    }

    /**
     * Handles the update of an employee evaluation based on the provided public ID and request data.
     *
     * This method retrieves the employee evaluation by its public ID, creates a form for the evaluation,
     * and processes the submitted request data. If the form is submitted and valid, the evaluation is updated,
     * and an event is dispatched to finalize the evaluation process. A success response is then returned.
     * In case of invalid submission, a bad request response is returned with an appropriate error message.
     *
     * @param string  $publicId The public identifier of the employee evaluation.
     * @param Request $request  The HTTP request containing the submitted form data.
     *
     * @return JsonResponse Returns a JSON response indicating the result of the operation.
     */
    #[Route('/{publicId}', name: 'put', methods: ['PUT'])]
    public function put(
        string  $publicId,
        Request $request,
    ): JsonResponse
    {
        $evaluation = $this->getEmployeeEvaluationByPublicId($publicId);

        $form = $this->createForm(EmployeeEvaluationFormType::class, $evaluation);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {

            $this->dispatcher->dispatch(new FinalizeEmployeeEvaluationEvent($evaluation));

            $this->employeeEvaluationRepository->update($evaluation);

            return $this->createEmployeeEvaluationResponse([
                'message' => $this->translator->trans('updated.employee_evaluation'),
                'evaluation' => $evaluation,
            ], Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.employee_evaluation', domain: 'errors'));
    }
}
