<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EvaluationTemplateCriteriaTrait;
use App\ApiController\Trait\EvaluationTemplateTrait;
use App\Controller\AbstractController;
use App\Entity\EvaluationTemplate;
use App\Entity\EvaluationTemplateCriteria;
use App\Entity\User;
use App\Event\EvaluationTemplate\EvaluationTemplateCreatedEvent;
use App\Form\EvaluationTemplateFormType;
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
#[Route(path: '/evaluation-templates', name: 'evaluation_templates_')]
#[OA\Tag(name: 'Evaluation Template')]
class EvaluationTemplateController extends AbstractController
{
    use EvaluationTemplateTrait;
    use EvaluationTemplateCriteriaTrait;

    public function __construct(
        TranslatorInterface                                   $translator,
        private readonly EvaluationTemplateRepository         $evaluationTemplateRepository,
        private readonly EvaluationTemplateCriteriaRepository $evaluationTemplateCriteriaRepository,
        private readonly EventDispatcherInterface             $dispatcher,
    )
    {
        parent::__construct($translator);
    }

    /**
     * Retrieves all evaluation templates.
     *
     * @return JsonResponse the JSON response containing the list of evaluation templates
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a list of evaluation templates.',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: EvaluationTemplate::class, groups: ['template:read']))
        )
    )]
    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(
        #[CurrentUser]
        User $user,
    ): JsonResponse
    {
        $templates = $this->evaluationTemplateRepository->findByUser($user);

        return $this->createTemplateResponse($templates);
    }

    /**
     * Creates a new evaluation template.
     *
     * @param Request $request the HTTP request containing the evaluation template data
     *
     * @return JsonResponse the JSON response containing the created evaluation template
     *
     * @throws RandomException
     */
    #[OA\Response(
        response: Response::HTTP_CREATED,
        description: 'Creates a new evaluation template.',
        content: new OA\JsonContent(ref: new Model(type: EvaluationTemplate::class, groups: ['template:read']))
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
        $template = $this->evaluationTemplateRepository->create();
        $form = $this->createForm(EvaluationTemplateFormType::class, $template);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            if ($this->evaluationTemplateRepository->findByNameAndUser($template->getName(), $this->getUser())) {
                return $this->createBadRequestResponse($this->translator->trans('existed.evaluation_template', ['%name%' => $template->getName()], domain: 'errors'));
            }
            $template->setUser($this->getUser());
            $this->evaluationTemplateRepository->updateEvaluationTemplate($template);
            $this->dispatcher->dispatch(new EvaluationTemplateCreatedEvent($template, $form->get('criterias')->getData()));

            return $this->createTemplateResponse([
                'message' => $this->translator->trans('created.evaluation_template', ['%name%' => $template->getName()]),
                'template' => $template,
            ], Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.evaluation_template', domain: 'errors'));
    }

    /**
     * Deletes an evaluation template.
     *
     * @param string $identifier the identifier of the evaluation template to delete
     *
     * @return JsonResponse the JSON response indicating the deletion status
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
                new OA\Property(property: 'message', description: 'Confirmation message after deletion', type: 'string'),
            ]
        )
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Evaluation template not found.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Error message', type: 'string'),
            ]
        )
    )]
    #[Route('/{identifier}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $identifier): JsonResponse
    {
        $template = $this->getEvaluationTemplateByIdentifier($identifier);

        $this->evaluationTemplateRepository->remove($template);

        return $this->createTemplateResponse([
            'message' => $this->translator->trans('deleted.evaluation_template', ['%name%' => $template->getName()]),
        ]);
    }

    /**
     * Retrieves an evaluation template by its identifier.
     *
     * @param string $identifier the identifier of the evaluation template
     *
     * @return JsonResponse the JSON response containing the evaluation template
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
        content: new OA\JsonContent(ref: new Model(type: EvaluationTemplate::class, groups: ['template:read']))
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Evaluation template not found.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Error message', type: 'string'),
            ]
        )
    )]
    #[Route('/{identifier}', name: 'get', methods: ['GET'])]
    public function get(string $identifier): JsonResponse
    {
        $template = $this->getEvaluationTemplateByIdentifier($identifier);

        return $this->createTemplateResponse($template);
    }

    /**
     * Updates an existing evaluation template.
     *
     * @param Request $request    the HTTP request containing the updated evaluation template data
     * @param string  $identifier the identifier of the evaluation template to update
     *
     * @return JsonResponse the JSON response containing the updated evaluation template
     *
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
        content: new OA\JsonContent(ref: new Model(type: EvaluationTemplate::class, groups: ['template:read']))
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
        $template = $this->getEvaluationTemplateByIdentifier($identifier);
        $form = $this->createForm(EvaluationTemplateFormType::class, $template);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $this->evaluationTemplateRepository->updateEvaluationTemplate($template);

            return $this->createTemplateResponse([
                'message' => $this->translator->trans('updated.evaluation_template', ['%name%' => $template->getName()]),
                'template' => $template,
            ]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.evaluation_template', domain: 'errors'));
    }

    /**
     * Retrieves the criteria associated with the evaluation template.
     *
     * @param string $identifier the identifier of the evaluation template
     *
     * @return JsonResponse the list of criteria associated with the evaluation template
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns the criteria associated with the evaluation template.',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: EvaluationTemplateCriteria::class, groups: ['criteria:read']))
        )
    )]
    #[Route('/{identifier}/criterias', name: 'get_criterias', methods: ['GET'])]
    public function getCriterias(string $identifier): JsonResponse
    {
        $template = $this->getEvaluationTemplateByIdentifier($identifier);

        $criterias = $this->evaluationTemplateCriteriaRepository->findBy(['template' => $template]);

        return $this->createTemplateCriteriaResponse($criterias);
    }
}
