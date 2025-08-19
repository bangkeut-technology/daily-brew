<?php

declare(strict_types=1);

namespace App\ApiController\Trait;

use App\Entity\EmployeeEvaluation;
use App\Repository\EmployeeEvaluationRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Trait EmployeeEvaluationTrait.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
trait EmployeeEvaluationTrait
{
    public function __construct(private readonly EmployeeEvaluationRepository $employeeEvaluationRepository)
    {
    }

    /**
     * Create a JSON response for employee evaluation.
     *
     * @param mixed $data    The data to be returned in the response
     * @param int   $status  The HTTP status code (default: 200 OK)
     * @param array $context The serialization context (default: employee, user, store, role, template read groups)
     */
    private function createEmployeeEvaluationResponse(
        mixed $data,
        int   $status = Response::HTTP_OK,
        array $context = ['groups' => [
            'employee_evaluation:read',
            'employee_score:read',
            'employee:read',
            'user:read',
            'store:read',
            'role:read',
            'template:read'
        ]],
    ): JsonResponse
    {
        return $this->json($data, $status, context: $context);
    }

    /**
     * Get employee evaluation by publicId and current user.
     *
     * @param string $publicId The unique publicId of the employee evaluation
     *
     * @return EmployeeEvaluation The found employee evaluation
     */
    private function getEmployeeEvaluationByPublicId(string $publicId): EmployeeEvaluation
    {
        if (null === $employee = $this->employeeEvaluationRepository->findByPublicIdAndUser($publicId, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.employee', ['%publicId%' => $publicId], domain: 'errors'));
        }

        return $employee;
    }
}
