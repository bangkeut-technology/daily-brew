<?php
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EvaluationCriteriaTrait;
use App\Controller\AbstractController;
use App\Entity\EvaluationCriteria;
use App\Entity\User;
use App\Form\EvaluationCriteriaFormType;
use App\Repository\EvaluationCriteriaRepository;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Random\RandomException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class EvaluationCriteriaController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route(path: '/evaluation-criterias', name: 'evaluation_criterias_')]
#[OA\Tag(name: 'Evaluation Criteria')]
class EvaluationCriteriaController extends AbstractController
{
    use EvaluationCriteriaTrait;

    public function __construct(
        TranslatorInterface $translator,
        private readonly EvaluationCriteriaRepository $evaluationCriteriaRepository
    )
    {
        parent::__construct($translator);
    }

    /**
     * Retrieves all evaluation templates.
     *
     * @return JsonResponse The JSON response containing the list of evaluation templates.
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a list of evaluation templates.',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: EvaluationCriteria::class, groups: ['evaluation_template:read']))
        )
    )]
    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(
        #[CurrentUser]
        User $user,
    ): JsonResponse
    {
        $templates = $this->evaluationCriteriaRepository->findByUser($user);

        return $this->createCriteriaResponse($templates);
    }

    /**
     * Creates a new evaluation template.
     *
     * @param Request $request The HTTP request containing the evaluation template data.
     * @return JsonResponse The JSON response containing the created evaluation template.
     * @throws RandomException
     */
    #[OA\Response(
        response: Response::HTTP_CREATED,
        description: 'Creates a new evaluation template.',
        content: new OA\JsonContent(ref: new Model(type: EvaluationCriteria::class, groups: ['evaluation_template:read']))
    )]
    #[OA\RequestBody(
        description: 'The evaluation template data to create.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'name', description: 'The name of the evaluation template', type: 'string'),
                new OA\Property(property: 'description', description: 'The description of the evaluation template', type: 'string'),
            ]
        )
    )]
    #[Route(name: 'post', methods: ['POST'])]
    public function post(Request $request): JsonResponse
    {
        $template = $this->evaluationCriteriaRepository->create();
        $form = $this->createForm(EvaluationCriteriaFormType::class, $template);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $template->setUser($this->getUser());
            $this->evaluationCriteriaRepository->updateEvaluationCriteria($template);
        }

        return $this->createCriteriaResponse($template, Response::HTTP_CREATED);
    }

    /**
     * Deletes an evaluation template.
     *
     * @param string $identifier The identifier of the evaluation template to delete.
     * @return JsonResponse The JSON response indicating the deletion status.
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The identifier of the evaluation template to delete.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Deletes an evaluation template.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Confirmation message after deletion', type: 'string')
            ]
        )
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Evaluation template not found.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Error message', type: 'string')
            ]
        )
    )]
    #[Route('/{identifier}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $identifier): JsonResponse
    {
        $template = $this->getEvaluationCriteriaByIdentifier($identifier);

        $this->evaluationCriteriaRepository->remove($template);

        return $this->createCriteriaResponse([
            'message' => $this->translator->trans('deleted.evaluation_template', ['%name%' => $template->getName()]),
        ]);
    }

    /**
     * Retrieves an evaluation template by its identifier.
     *
     * @param string $identifier The identifier of the evaluation template.
     * @return JsonResponse The JSON response containing the evaluation template.
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The identifier of the evaluation template to retrieve.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns an evaluation template by its identifier.',
        content: new OA\JsonContent(ref: new Model(type: EvaluationCriteria::class, groups: ['evaluation_template:read']))
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Evaluation template not found.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Error message', type: 'string')
            ]
        )
    )]
    #[Route('/{identifier}', name: 'get', methods: ['GET'])]
    public function get(string $identifier): JsonResponse
    {
        $template = $this->getEvaluationCriteriaByIdentifier($identifier);

        return $this->createCriteriaResponse($template);
    }

    /**
     * Updates an existing evaluation template.
     *
     * @param Request $request The HTTP request containing the updated evaluation template data.
     * @param string  $identifier The identifier of the evaluation template to update.
     * @return JsonResponse The JSON response containing the updated evaluation template.
     * @throws RandomException
     */
    #[OA\Parameter(
        name: 'identifier',
        description: 'The identifier of the evaluation template to update.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Updates an existing evaluation template.',
        content: new OA\JsonContent(ref: new Model(type: EvaluationCriteria::class, groups: ['evaluation_template:read']))
    )]
    #[OA\RequestBody(
        description: 'The evaluation template data to update.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'name', description: 'The name of the evaluation template', type: 'string'),
                new OA\Property(property: 'description', description: 'The description of the evaluation template', type: 'string'),
            ]
        )
    )]
    #[Route('/{identifier}', name: 'put', methods: ['PUT'])]
    public function put(Request $request, string $identifier): JsonResponse
    {
        $template = $this->getEvaluationCriteriaByIdentifier($identifier);
        $form = $this->createForm(EvaluationCriteriaFormType::class, $template);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $this->evaluationCriteriaRepository->updateEvaluationCriteria($template);
        }

        return $this->createCriteriaResponse($template);
    }
}
