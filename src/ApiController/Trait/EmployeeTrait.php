<?php

declare(strict_types=1);

namespace App\ApiController\Trait;

use App\Entity\Employee;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Trait EmployeeTrait.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
trait EmployeeTrait
{
    /**
     * This method is used to create an employee response.
     *
     * @param mixed $data   the data to return in the response
     * @param int   $status the status publicId of the response
     *
     * @return JsonResponse the created JSON response
     */
    private function createEmployeeResponse(mixed $data, int $status = Response::HTTP_OK): JsonResponse
    {
        return $this->json($data, $status);
    }

    /**
     * Get employee by publicId and current user.
     *
     * @param string $publicId The unique publicId of the employee
     */
    private function getEmployeeByPublicId(string $publicId): Employee
    {
        if (null === $employee = $this->employeeRepository->findByPublicIdAndUser($publicId, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.employee', ['%publicId%' => $publicId], domain: 'errors'));
        }

        return $employee;
    }
}
