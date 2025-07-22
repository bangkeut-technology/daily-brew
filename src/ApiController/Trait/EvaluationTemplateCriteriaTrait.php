<?php

declare(strict_types=1);

namespace App\ApiController\Trait;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Trait EvaluationTemplateCriteriaTrait.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
trait EvaluationTemplateCriteriaTrait
{
    /**
     * Create a JSON response for evaluation template criteria.
     *
     * @param mixed $data       the data to be included in the response
     * @param int   $statusCode the HTTP status code for the response
     */
    private function createTemplateCriteriaResponse(mixed $data, int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return $this->json(
            $data,
            $statusCode,
            context: [
                'groups' => ['template_criteria:read', 'template:read', 'criteria:read'],
            ]
        );
    }
}
