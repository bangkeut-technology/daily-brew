<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EmployeeTrait;
use App\Controller\AbstractController;
use App\Enum\ApiErrorCodeEnum;
use App\Form\EmployeeSalaryFormType;
use App\Repository\EmployeeRepository;
use App\Repository\EmployeeSalaryRepository;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class EmployeeSalaryController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/employees/{publicId}/salary', name: 'employee_salary_')]
#[OA\Tag(name: 'Payroll')]
class EmployeeSalaryController extends AbstractController
{
    use EmployeeTrait;

    public function __construct(
        TranslatorInterface                        $translator,
        private readonly EmployeeRepository        $employeeRepository,
        private readonly EmployeeSalaryRepository  $employeeSalaryRepository,
    )
    {
        parent::__construct($translator);
    }

    #[Route(name: 'get', methods: ['GET'])]
    public function get(string $publicId): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $salary = $this->employeeSalaryRepository->findByEmployee($employee);

        if (null === $salary) {
            return $this->json(['message' => 'No salary configured for this employee.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($salary, Response::HTTP_OK, [], ['groups' => ['employee_salary:read']]);
    }

    #[Route(name: 'upsert', methods: ['POST'])]
    public function upsert(string $publicId, Request $request): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);

        $salary = $this->employeeSalaryRepository->findByEmployee($employee) ?? $this->employeeSalaryRepository->create();
        $salary->setEmployee($employee);
        $salary->setWorkspace($employee->getWorkspace());

        $form = $this->createForm(EmployeeSalaryFormType::class, $salary);
        $form->submit($request->getPayload()->all(), null === $salary->getEmployee());

        if ($form->isSubmitted() && $form->isValid()) {
            $this->employeeSalaryRepository->update($salary);

            return $this->json($salary, Response::HTTP_OK, [], ['groups' => ['employee_salary:read']]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.employee_salary', domain: 'errors'));
    }

    #[Route(name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId): JsonResponse
    {
        $employee = $this->getEmployeeByPublicId($publicId);
        $salary = $this->employeeSalaryRepository->findByEmployee($employee);

        if (null === $salary) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['salary' => 'No salary found.']);
        }

        $this->employeeSalaryRepository->delete($salary);

        return $this->json(['message' => 'Salary deleted.'], Response::HTTP_OK);
    }
}
