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
     * @param mixed $data        The data to return in the response.
     * @param int   $statusCode  The HTTP status code of the response.
     *
     * @return JsonResponse
     */
    private function createTemplateResponse(mixed $data, int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return $this->json(
            $data,
            $statusCode,
            context: ['groups' => ['evaluation_template:read']]
        );
    }

    /**
     * Retrieves an evaluation template by its identifier.
     *
     * @param string $identifier The identifier of the evaluation template.
     *
     * @return EvaluationTemplate
     */
    private function getEvaluationTemplateByIdentifier(string $identifier): EvaluationTemplate
    {
        if (null ===$template = $this->evaluationTemplateRepository->findByIdentifierAndUser($identifier, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.evaluation_template', ['%identifier%' => $identifier], 'errors'));
        }

        return $template;
    }
}
