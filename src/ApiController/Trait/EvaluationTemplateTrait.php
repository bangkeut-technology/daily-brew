<?php

declare(strict_types=1);

namespace App\ApiController\Trait;

use App\Entity\EvaluationTemplate;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait EvaluationTemplateTrait
{
    /**
     * Creates a template response.
     *
     * @param mixed $data       the data to return in the response
     * @param int   $statusCode the HTTP status code of the response
     */
    private function createTemplateResponse(mixed $data, int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return $this->json($data, $statusCode);
    }

    /**
     * Retrieves an evaluation template by its publicId.
     *
     * @param string $publicId the publicId of the evaluation template
     */
    private function getEvaluationTemplateByPublicId(string $publicId): EvaluationTemplate
    {
        if (null === $template = $this->evaluationTemplateRepository->findByPublicIdAndUser($publicId, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.evaluation_template', ['%publicId%' => $publicId], 'errors'));
        }

        return $template;
    }
}
