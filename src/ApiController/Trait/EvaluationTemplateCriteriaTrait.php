<?php
declare(strict_types=1);

namespace App\ApiController\Trait;

use Symfony\Component\HttpFoundation\Response;

/**
 * Trait EvaluationTemplateCriteriaTrait
 *
 * @package App\ApiController\Trait
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
trait EvaluationTemplateCriteriaTrait
{
    private function createTemplateCriteriaResponse(mixed $data, int $statusCode = Response::HTTP_OK): array
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
