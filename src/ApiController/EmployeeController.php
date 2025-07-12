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
            $this->employeeRepository->save($employee);
            return $this->createEmployeeResponse($employee, Response::HTTP_CREATED);
        }
        // This method is not implemented yet.
        return new JsonResponse(['message' => 'Not implemented'], Response::HTTP_NOT_IMPLEMENTED);
    }
}
