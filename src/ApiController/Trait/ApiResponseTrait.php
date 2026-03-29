<?php

namespace App\ApiController\Trait;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait ApiResponseTrait
{
    /**
     * Copy refresh_token from its cookie into the JSON body so mobile
     * clients can store it (httpOnly cookies don't work on mobile).
     */
    protected function withRefreshTokenInBody(Response $response): Response
    {
        foreach ($response->headers->getCookies() as $cookie) {
            if ($cookie->getName() === 'refresh_token') {
                $data = json_decode($response->getContent(), true);
                $data['refresh_token'] = $cookie->getValue();
                $response->setContent(json_encode($data));
                break;
            }
        }

        return $response;
    }

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
