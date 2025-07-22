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
        return $this->json(
            $data,
            $statusCode,
            context: ['groups' => ['criteria:read']]
        );
    }

    /**
     * Retrieves an evaluation criteria by its identifier.
     *
     * @param string $identifier the identifier of the evaluation criteria
     */
    private function getEvaluationCriteriaByIdentifier(string $identifier): EvaluationCriteria
    {
        if (null === $criteria = $this->evaluationCriteriaRepository->findByIdentifierAndUser($identifier, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.evaluation_criteria', ['%identifier%' => $identifier], 'errors'));
        }

        return $criteria;
    }
}
