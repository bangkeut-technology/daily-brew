<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EmployeeTrait;
use App\ApiController\Trait\EvaluationTemplateCriteriaTrait;
use App\ApiController\Trait\EvaluationTemplateTrait;
use App\Controller\AbstractController;
use App\Entity\Employee;
use App\Entity\EvaluationTemplate;
use App\Entity\EvaluationTemplateCriteria;
use App\Entity\User;
use App\Event\EvaluationTemplate\EvaluationTemplateCreatedEvent;
use App\Form\EvaluationTemplateFormType;
use App\Repository\EvaluationCriteriaRepository;
use App\Repository\EvaluationTemplateCriteriaRepository;
use App\Repository\EvaluationTemplateRepository;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Random\RandomException;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
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
     * @param string $identifier The identifier of the evaluation template criteria
     *
     * @return JsonResponse
     */
    #[Route(name: 'deletes', methods: ['DELETE'])]
    public function deletes(string $identifier): JsonResponse
    {
        $evaluationTemplateCriteria = $this->getEvaluationTemplateCriteriaByIdentifier($identifier);

        $this->evaluationTemplateCriteriaRepository->delete($evaluationTemplateCriteria);

        $criteria = $evaluationTemplateCriteria->getCriteria();
        $template = $evaluationTemplateCriteria->getTemplate();

        return $this->createTemplateCriteriaResponse([
            'message' => $this->translator->trans('deleted.evaluation_template_criteria', ['%criteria%' => $criteria, '%template%' => $template]),
        ]);
    }
}
