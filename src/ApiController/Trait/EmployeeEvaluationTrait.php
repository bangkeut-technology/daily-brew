<?php

declare(strict_types=1);

namespace App\ApiController\Trait;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Trait EmployeeEvaluationTrait.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
trait EmployeeEvaluationTrait
{
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
}
