<?php
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EmployeeTrait;
use App\Controller\AbstractController;
use App\Entity\User;
use App\Form\EmployeeFormType;
use App\Repository\EmployeeRepository;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Random\RandomException;
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

    public function __construct(
        TranslatorInterface                 $translator,
        private readonly EmployeeRepository $employeeRepository,
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
            properties: [
                new OA\Property(
                    property: 'firstName',
                    type: 'string',
                    example: 'John'
                ),
                new OA\Property(
                    property: 'lastName',
                    type: 'string',
                    example: 'Doe'
                ),
                new OA\Property(
                    property: 'phoneNumber',
                    type: 'string',
                    example: '+1234567890'
                ),
                new OA\Property(
                    property: 'dob',
                    type: 'string',
                    format: 'datetime'
                ),
                new OA\Property(
                    property: 'joinedAt',
                    type: 'string',
                    format: 'datetime'
                ),
                new OA\Property(
                    property: 'roles',
                    type: 'array',
                    items: new OA\Items(
                        type: 'number',
                        example: '1'
                    ),
                )
            ],
            type: 'object'
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
        $employee = $this->employeeRepository->create();
        $form = $this->createForm(EmployeeFormType::class, $employee);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $employee->setUser($user);
            $this->employeeRepository->updateEmployee($employee);
            return $this->createEmployeeResponse($employee, Response::HTTP_CREATED);
        }

        return $this->json(
            ['message' => $this->translator->trans('invalid.employee', domain: 'errors')],
            Response::HTTP_BAD_REQUEST
        );
    }
}
