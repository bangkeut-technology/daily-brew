<?php

declare(strict_types=1);

namespace App\ApiController\Trait;

use App\Entity\EvaluationCriteria;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait EvaluationCriteriaTrait
{
    /**
     * Creates a criteria response.
     *
     * @param mixed $data       the data to return in the response
     * @param int   $statusCode the HTTP status code of the response
     */
    private function createCriteriaResponse(mixed $data, int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return $this->json($data, $statusCode);
    }

    /**
     * Retrieves an evaluation criteria by its publicId.
     *
     * @param string $publicId the publicId of the evaluation criteria
     */
    private function getEvaluationCriteriaByPublicId(string $publicId): EvaluationCriteria
    {
        if (null === $criteria = $this->evaluationCriteriaRepository->findByPublicIdAndUser($publicId, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.evaluation_criteria', ['%publicId%' => $publicId], 'errors'));
        }

        return $criteria;
    }
}
