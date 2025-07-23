<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EvaluationCriteriaTrait;
use App\Controller\AbstractController;
use App\Entity\EvaluationCriteria;
use App\Entity\User;
use App\Event\EvaluationCriteria\EvaluationCriteriaCreatedEvent;
use App\Form\EvaluationCriteriaFormType;
use App\Repository\EvaluationCriteriaRepository;
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
 * Class EvaluationCriteriaController.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route(path: '/evaluation-criterias', name: 'evaluation_criterias_')]
#[OA\Tag(name: 'Evaluation Criteria')]
class EvaluationCriteriaController extends AbstractController
{
    use EvaluationCriteriaTrait;

    public function __construct(
        TranslatorInterface                           $translator,
        private readonly EvaluationCriteriaRepository $evaluationCriteriaRepository,
        private readonly EventDispatcherInterface     $dispatcher,
    )
    {
        parent::__construct($translator);
    }

    /**
     * Retrieves all evaluation criterias.
     *
     * @return JsonResponse the JSON response containing the list of evaluation criterias
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a list of evaluation criterias.',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: EvaluationCriteria::class, groups: ['criteria:read']))
        )
    )]
    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(
        #[CurrentUser]
        User $user,
    ): JsonResponse
    {
        $criterias = $this->evaluationCriteriaRepository->findByUser($user);

        return $this->createCriteriaResponse($criterias);
    }

    /**
     * Creates a new evaluation criteria.
     *
     * @param Request $request the HTTP request containing the evaluation criteria data
     *
     * @return JsonResponse the JSON response containing the created evaluation criteria
     *
     * @throws RandomException
     */
    #[OA\Response(
        response: Response::HTTP_CREATED,
        description: 'Creates a new evaluation criteria.',
        content: new OA\JsonContent(ref: new Model(type: EvaluationCriteria::class, groups: ['criteria:read']))
    )]
    #[OA\RequestBody(
        description: 'The evaluation criteria data to create.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'name', description: 'The name of the evaluation criteria', type: 'string'),
                new OA\Property(property: 'description', description: 'The description of the evaluation criteria', type: 'string'),
            ]
        )
    )]
    #[Route(name: 'post', methods: ['POST'])]
    public function post(Request $request): JsonResponse
    {
        $criteria = $this->evaluationCriteriaRepository->create();
        $form = $this->createForm(EvaluationCriteriaFormType::class, $criteria);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $criteria->setUser($this->getUser());
            $this->evaluationCriteriaRepository->updateEvaluationCriteria($criteria);

            $this->dispatcher->dispatch(new EvaluationCriteriaCreatedEvent($criteria, $form->get('templates')->getData()));

            return $this->createCriteriaResponse([
                'message' => $this->translator->trans('created.evaluation_criteria', ['%label%' => $criteria->getLabel()]),
                'criteria' => $criteria,
            ], Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.evaluation_criteria', domain: 'errors'));
    }

    /**
     * Deletes an evaluation criteria.
     *
     * @param string $identifier the identifier of the evaluation criteria to delete
     *
     * @return JsonResponse the JSON response indicating the deletion status
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The identifier of the evaluation criteria to delete.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Deletes an evaluation criteria.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Confirmation message after deletion', type: 'string'),
            ]
        )
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Evaluation criteria not found.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Error message', type: 'string'),
            ]
        )
    )]
    #[Route('/{identifier}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $identifier): JsonResponse
    {
        $criteria = $this->getEvaluationCriteriaByIdentifier($identifier);

        $this->evaluationCriteriaRepository->remove($criteria);

        return $this->createCriteriaResponse([
            'message' => $this->translator->trans('deleted.evaluation_criteria', ['%label%' => $criteria->getLabel()]),
        ]);
    }

    /**
     * Retrieves an evaluation criteria by its identifier.
     *
     * @param string $identifier the identifier of the evaluation criteria
     *
     * @return JsonResponse the JSON response containing the evaluation criteria
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The identifier of the evaluation criteria to retrieve.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns an evaluation criteria by its identifier.',
        content: new OA\JsonContent(ref: new Model(type: EvaluationCriteria::class, groups: ['criteria:read']))
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Evaluation criteria not found.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Error message', type: 'string'),
            ]
        )
    )]
    #[Route('/{identifier}', name: 'get', methods: ['GET'])]
    public function get(string $identifier): JsonResponse
    {
        $criteria = $this->getEvaluationCriteriaByIdentifier($identifier);

        return $this->createCriteriaResponse($criteria);
    }

    /**
     * Updates an existing evaluation criteria.
     *
     * @param Request $request    the HTTP request containing the updated evaluation criteria data
     * @param string  $identifier the identifier of the evaluation criteria to update
     *
     * @return JsonResponse the JSON response containing the updated evaluation criteria
     *
     * @throws RandomException
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The identifier of the evaluation criteria to update.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Updates an existing evaluation criteria.',
        content: new OA\JsonContent(ref: new Model(type: EvaluationCriteria::class, groups: ['criteria:read']))
    )]
    #[OA\RequestBody(
        description: 'The evaluation criteria data to update.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'name', description: 'The name of the evaluation criteria', type: 'string'),
                new OA\Property(property: 'description', description: 'The description of the evaluation criteria', type: 'string'),
            ]
        )
    )]
    #[Route('/{identifier}', name: 'put', methods: ['PUT'])]
    public function put(Request $request, string $identifier): JsonResponse
    {
        $criteria = $this->getEvaluationCriteriaByIdentifier($identifier);
        $form = $this->createForm(EvaluationCriteriaFormType::class, $criteria);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $this->evaluationCriteriaRepository->updateEvaluationCriteria($criteria);
        }

        return $this->createCriteriaResponse($criteria);
    }
}
