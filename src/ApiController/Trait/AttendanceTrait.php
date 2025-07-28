<?php
declare(strict_types=1);

namespace App\ApiController\Trait;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Trait AttendanceTrait
 *
 * @package App\ApiController\Trait
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
trait AttendanceTrait
{
    /**
     * Create a JSON response for attendance data.
     *
     * @param mixed $data       The data to include in the response.
     * @param int   $statusCode The HTTP status code for the response, default is 200 OK.
     *
     * @return JsonResponse
     */
    private function createAttendanceResponse(mixed $data, int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return $this->json($data, $statusCode, context: ['groups' => ['attendance:read']]);
    }
}
