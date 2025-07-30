<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EvaluationTemplateCriteriaTrait;
use App\Controller\AbstractController;
use App\Repository\EvaluationTemplateCriteriaRepository;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class EvaluationTemplateController.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route(path: '/evaluation-template-criterias', name: 'evaluation_template_criterias_')]
#[OA\Tag(name: 'Evaluation Template Criteria')]
class EvaluationTemplateCriteriaController extends AbstractController
{
    use EvaluationTemplateCriteriaTrait;

    public function __construct(
        TranslatorInterface                                   $translator,
        private readonly EvaluationTemplateCriteriaRepository $evaluationTemplateCriteriaRepository,
    )
    {
        parent::__construct($translator);
    }

    /**
     * Remove an evaluation template criteria.
     *
     * @param string $publicId The publicId of the evaluation template criteria
     *
     * @return JsonResponse
     */
    #[Route('/{publicId}', name: 'deletes', methods: ['DELETE'])]
    public function deletes(string $publicId): JsonResponse
    {
        $evaluationTemplateCriteria = $this->getEvaluationTemplateCriteriaByPublicId($publicId);

        $this->evaluationTemplateCriteriaRepository->delete($evaluationTemplateCriteria);

        $criteria = $evaluationTemplateCriteria->getCriteria();
        $template = $evaluationTemplateCriteria->getTemplate();

        return $this->createTemplateCriteriaResponse([
            'message' => $this->translator->trans('deleted.evaluation_template_criteria', ['%criteria%' => $criteria, '%template%' => $template]),
        ]);
    }
}
