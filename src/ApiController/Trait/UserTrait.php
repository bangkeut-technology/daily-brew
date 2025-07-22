<?php

declare(strict_types=1);

namespace App\ApiController\Trait;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Trait UserTrait.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
trait UserTrait
{
    /**
     * Creates a JSON response with a message indicating that the request is invalid.
     *
     * @param mixed $data   the data to include in the response
     * @param int   $status the status code of the response
     *
     * @return JsonResponse the JSON response object
     */
    private function createUserResponse(mixed $data, int $status = Response::HTTP_OK): JsonResponse
    {
        return $this->json($data, $status, context: ['groups' => ['user:read']]);
    }
}
