<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EvaluationCriteriaTrait;
use App\ApiController\Trait\EvaluationTemplateCriteriaTrait;
use App\Controller\AbstractController;
use App\DTO\EvaluationCriteriaDTO;
use App\DTO\EvaluationTemplateCriteriaDTO;
use App\Entity\User;
use App\Event\EvaluationCriteria\EvaluationCriteriaCreatedEvent;
use App\Form\EvaluationCriteriaFormType;
use App\Repository\EvaluationCriteriaRepository;
use App\Repository\EvaluationTemplateRepository;
use OpenApi\Attributes as OA;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class EvaluationCriteriaController.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route(path: '/evaluation-criterias', name: 'evaluation_criterias_')]
#[OA\Tag(name: 'Evaluation Criteria')]
class EvaluationCriteriaController extends AbstractController
{
    use EvaluationCriteriaTrait;
    use EvaluationTemplateCriteriaTrait;

    public function __construct(
        TranslatorInterface                           $translator,
        private readonly EvaluationCriteriaRepository $evaluationCriteriaRepository,
        private readonly EventDispatcherInterface     $dispatcher,
        private readonly EvaluationTemplateRepository $evaluationTemplateRepository,
    )
    {
        parent::__construct($translator);
    }

    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(#[CurrentUser] User $user): JsonResponse
    {
        $criterias = $this->evaluationCriteriaRepository->findByUser($user);

        return $this->createCriteriaResponse(EvaluationCriteriaDTO::fromEntities($criterias));
    }

    #[Route(name: 'post', methods: ['POST'])]
    public function post(Request $request): JsonResponse
    {
        $criteria = $this->evaluationCriteriaRepository->create();
        $form = $this->createForm(EvaluationCriteriaFormType::class, $criteria);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            if (null !== $this->evaluationCriteriaRepository->findByLabelAndUser($criteria->getLabel(), $this->getUser())) {
                return $this->createBadRequestResponse($this->translator->trans('existed.evaluation_criteria', ['%label%' => $criteria->getLabel()], domain: 'errors'));
            }
            $user = $this->getUser();
            $criteria->setUser($user);
            $criteria->setWorkspace($user->getCurrentWorkspace());
            $this->evaluationCriteriaRepository->update($criteria);

            $this->dispatcher->dispatch(new EvaluationCriteriaCreatedEvent($criteria, $form->get('templates')->getData()));

            return $this->createCriteriaResponse([
                'message'  => $this->translator->trans('created.evaluation_criteria', ['%label%' => $criteria->getLabel()]),
                'criteria' => EvaluationCriteriaDTO::fromEntity($criteria),
            ], Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.evaluation_criteria', domain: 'errors'));
    }

    #[Route('/{publicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId): JsonResponse
    {
        $criteria = $this->getEvaluationCriteriaByPublicId($publicId);
        $this->evaluationCriteriaRepository->remove($criteria);

        return $this->createCriteriaResponse([
            'message' => $this->translator->trans('deleted.evaluation_criteria', ['%label%' => $criteria->getLabel()]),
        ]);
    }

    #[Route('/{publicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId): JsonResponse
    {
        $criteria = $this->getEvaluationCriteriaByPublicId($publicId);

        return $this->createCriteriaResponse(EvaluationCriteriaDTO::fromEntity($criteria));
    }

    #[Route('/{publicId}', name: 'put', methods: ['PUT'])]
    public function put(Request $request, string $publicId): JsonResponse
    {
        $criteria = $this->getEvaluationCriteriaByPublicId($publicId);
        $form = $this->createForm(EvaluationCriteriaFormType::class, $criteria);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $this->evaluationCriteriaRepository->update($criteria);
        }

        return $this->createCriteriaResponse(EvaluationCriteriaDTO::fromEntity($criteria));
    }

    #[Route('/{publicId}/templates', name: 'get_templates', methods: ['GET'])]
    public function getTemplates(string $publicId): JsonResponse
    {
        $criteria = $this->getEvaluationCriteriaByPublicId($publicId);

        return $this->createTemplateCriteriaResponse(EvaluationTemplateCriteriaDTO::fromEntities($criteria->getTemplates()));
    }

    #[Route('/{publicId}/templates', name: 'post_templates', methods: ['POST'])]
    public function postTemplates(string $publicId, Request $request): JsonResponse
    {
        $criteria = $this->getEvaluationCriteriaByPublicId($publicId);
        $templates = $request->getPayload()->all('templates');
        if (count($templates) > 0) {
            $this->dispatcher->dispatch(new EvaluationCriteriaCreatedEvent(
                $criteria,
                $this->evaluationTemplateRepository->findByIdsAndUser($templates, $this->getUser())
            ));
        }

        return $this->createTemplateCriteriaResponse([
            'message' => $this->translator->trans('added.evaluation_criteria_template', ['%criteria%' => $criteria]),
        ]);
    }
}
