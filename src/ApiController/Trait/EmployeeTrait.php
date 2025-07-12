<?php
declare(strict_types=1);

namespace App\ApiController\Trait;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Trait EmployeeTrait
 *
 * @package App\ApiController\Trait
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
trait EmployeeTrait
{
    /**
     * This method is used to create an employee response.
     *
     * @param mixed $data    The data to return in the response.
     * @param int   $status  The status identifier of the response.
     * @param array $context The context of the response. The default is ['groups' => ['employee:read', 'user:read']].
     * @return JsonResponse
     */
    private function createEmployeeResponse(mixed $data, int $status = Response::HTTP_OK, array $context = ['groups' => ['employee:read', 'user:read']]): JsonResponse
    {
        return $this->json($data, $status, context: $context);
    }
}
