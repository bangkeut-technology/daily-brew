<?php
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EmployeeTrait;
use App\ApiController\Trait\EvaluationTemplateTrait;
use App\Controller\AbstractController;
use App\Entity\User;
use App\Event\Employee\CheckEmployeeLimitEvent;
use App\Form\EmployeeFormType;
use App\Repository\EmployeeRepository;
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
 * Class EmployeeController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/employees', name: 'employees_')]
#[OA\Tag(name: 'Employees')]
class EmployeeController extends AbstractController
{
    use EmployeeTrait;
    use EvaluationTemplateTrait;

    public function __construct(
        TranslatorInterface                       $translator,
        private readonly EmployeeRepository       $employeeRepository,
        private readonly EventDispatcherInterface $dispatcher,
    )
    {
        parent::__construct($translator);
    }

    /**
     * Get employees by current user
     *
     * @param User $user
     * @return JsonResponse
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
        #[CurrentUser] User $user
    ): JsonResponse
    {
        $employees = $this->employeeRepository->findByUser($user);
        return $this->createEmployeeResponse($employees);
    }

    /**
     * Create a new employee for the current user
     *
     * @param Request $request
     * @param User    $user
     * @return JsonResponse
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
                )
            ],
            type: 'object'
        )
    )]
    #[Route(name: 'post', methods: ['POST'])]
    public function post(
        Request             $request,
        #[CurrentUser] User $user
    ): JsonResponse
    {
        $this->dispatcher->dispatch(new CheckEmployeeLimitEvent($this->getUser()));
        $employee = $this->employeeRepository->create();
        $form = $this->createForm(EmployeeFormType::class, $employee);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $employee->setUser($user);
            $this->employeeRepository->updateEmployee($employee);
            return $this->createEmployeeResponse([
                'employee' => $employee,
                'message' => $this->translator->trans('created.employee', ['%name%' => $employee], 'messages')
            ], Response::HTTP_CREATED);
        }

        return $this->json(
            ['message' => $this->translator->trans('invalid.employee', domain: 'errors')],
            Response::HTTP_BAD_REQUEST
        );
    }

    /**
     * Get employee details by identifier
     *
     * @param string $identifier The unique identifier of the employee
     * @return JsonResponse
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The unique identifier of the employee',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string', example: 'emp123')
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
                )
            ],
            type: 'object'
        )
    )]
    #[Route('/{identifier}', name: 'get', methods: ['GET'])]
    public function get(string $identifier): JsonResponse
    {
        $employee = $this->getEmployeeByIdentifier($identifier);
        return $this->createEmployeeResponse($employee);
    }

    /**
     * Update employee details by identifier
     *
     * @param Request $request
     * @param string  $identifier The unique identifier of the employee
     * @return JsonResponse
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
                )
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
                )
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
     * Delete employee by identifier
     *
     * @param string $identifier The unique identifier of the employee
     * @return JsonResponse
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
                )
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
            'message' => $this->translator->trans('deleted.employee', ['%name%' => $employee], domain: 'messages')
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
            $this->translator->trans('added.evaluation_template', ['%template%' => $template], 'messages')
        ]);
    }
}
