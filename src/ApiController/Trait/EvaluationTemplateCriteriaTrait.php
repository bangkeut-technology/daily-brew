<?php

declare(strict_types=1);

namespace App\ApiController\Trait;

use App\Entity\EvaluationTemplateCriteria;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

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

    /**
     * Get evaluation template criteria by identifier.
     *
     * @param string $identifier the identifier of the evaluation template criteria
     *
     * @return EvaluationTemplateCriteria the found evaluation template criteria
     *
     * @throws NotFoundHttpException if not found
     */
    private function getEvaluationTemplateCriteriaByIdentifier(string $identifier): EvaluationTemplateCriteria
    {
        if (null === $evaluationTemplateCriteria = $this->evaluationTemplateCriteriaRepository->findByIdentifierAndUser($identifier, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.evaluation_template_criteria', ['%identifier%' => $identifier], 'errors'));
        }

        return $evaluationTemplateCriteria;
    }
}
