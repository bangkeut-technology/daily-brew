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
     * Get evaluation template criteria by publicId.
     *
     * @param string $publicId the publicId of the evaluation template criteria
     *
     * @return EvaluationTemplateCriteria the found evaluation template criteria
     *
     * @throws NotFoundHttpException if not found
     */
    private function getEvaluationTemplateCriteriaByPublicId(string $publicId): EvaluationTemplateCriteria
    {
        if (null === $evaluationTemplateCriteria = $this->evaluationTemplateCriteriaRepository->findByPublicIdAndUser($publicId, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.evaluation_template_criteria', ['%publicId%' => $publicId], 'errors'));
        }

        return $evaluationTemplateCriteria;
    }
}
