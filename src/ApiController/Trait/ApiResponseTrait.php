<?php

namespace App\ApiController\Trait;

use Symfony\Component\HttpFoundation\JsonResponse;

trait ApiResponseTrait
{
    protected function jsonSuccess(mixed $data = null, int $status = 200): JsonResponse
    {
        return new JsonResponse($data, $status);
    }

    protected function jsonCreated(mixed $data = null): JsonResponse
    {
        return new JsonResponse($data, 201);
    }

    protected function jsonNoContent(): JsonResponse
    {
        return new JsonResponse(null, 204);
    }

    protected function jsonError(string $message, int $status = 400): JsonResponse
    {
        return new JsonResponse(['error' => true, 'message' => $message], $status);
    }
}
