<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\EmployeeTrait;
use App\ApiController\Trait\EvaluationTemplateCriteriaTrait;
use App\ApiController\Trait\EvaluationTemplateTrait;
use App\Controller\AbstractController;
use App\DTO\EmployeeDTO;
use App\DTO\EvaluationTemplateCriteriaDTO;
use App\DTO\EvaluationTemplateDTO;
use App\Entity\User;
use App\Event\EvaluationTemplate\EvaluationTemplateCreatedEvent;
use App\Form\EvaluationTemplateFormType;
use App\Repository\EmployeeRepository;
use App\Repository\EvaluationCriteriaRepository;
use App\Repository\EvaluationTemplateCriteriaRepository;
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
 * Class EvaluationTemplateController.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route(path: '/evaluation-templates', name: 'evaluation_templates_')]
#[OA\Tag(name: 'Evaluation Template')]
class EvaluationTemplateController extends AbstractController
{
    use EmployeeTrait;
    use EvaluationTemplateTrait;
    use EvaluationTemplateCriteriaTrait;

    public function __construct(
        TranslatorInterface                                   $translator,
        private readonly EvaluationTemplateRepository         $evaluationTemplateRepository,
        private readonly EvaluationTemplateCriteriaRepository $evaluationTemplateCriteriaRepository,
        private readonly EventDispatcherInterface             $dispatcher,
        private readonly EvaluationCriteriaRepository         $evaluationCriteriaRepository,
        private readonly EmployeeRepository                   $employeeRepository,
    )
    {
        parent::__construct($translator);
    }

    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(#[CurrentUser] User $user): JsonResponse
    {
        $templates = $this->evaluationTemplateRepository->findByUser($user);

        return $this->createTemplateResponse(EvaluationTemplateDTO::fromEntities($templates));
    }

    #[Route(name: 'post', methods: ['POST'])]
    public function post(Request $request): JsonResponse
    {
        $template = $this->evaluationTemplateRepository->create();
        $form = $this->createForm(EvaluationTemplateFormType::class, $template);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            if (null !== $this->evaluationTemplateRepository->findByNameAndUser($template->getName(), $this->getUser())) {
                return $this->createBadRequestResponse($this->translator->trans('existed.evaluation_template', ['%name%' => $template->getName()], domain: 'errors'));
            }
            $user = $this->getUser();
            $template->setUser($user);
            $template->setWorkspace($user->getCurrentWorkspace());
            $this->evaluationTemplateRepository->update($template);
            $this->dispatcher->dispatch(new EvaluationTemplateCreatedEvent($template, $form->get('criterias')->getData()));

            return $this->createTemplateResponse([
                'message'  => $this->translator->trans('created.evaluation_template', ['%name%' => $template->getName()]),
                'template' => EvaluationTemplateDTO::fromEntity($template),
            ], Response::HTTP_CREATED);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.evaluation_template', domain: 'errors'));
    }

    #[Route('/{publicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId): JsonResponse
    {
        $template = $this->getEvaluationTemplateByPublicId($publicId);
        $this->evaluationTemplateRepository->remove($template);

        return $this->createTemplateResponse([
            'message' => $this->translator->trans('deleted.evaluation_template', ['%name%' => $template->getName()]),
        ]);
    }

    #[Route('/{publicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId): JsonResponse
    {
        $template = $this->getEvaluationTemplateByPublicId($publicId);

        return $this->createTemplateResponse(EvaluationTemplateDTO::fromEntity($template, true));
    }

    #[Route('/{publicId}', name: 'put', methods: ['PUT'])]
    public function put(Request $request, string $publicId): JsonResponse
    {
        $template = $this->getEvaluationTemplateByPublicId($publicId);
        $form = $this->createForm(EvaluationTemplateFormType::class, $template);
        $form->submit($request->getPayload()->all(), false);
        if ($form->isSubmitted() && $form->isValid()) {
            $this->evaluationTemplateRepository->update($template);

            return $this->createTemplateResponse([
                'message'  => $this->translator->trans('updated.evaluation_template', ['%name%' => $template->getName()]),
                'template' => EvaluationTemplateDTO::fromEntity($template),
            ]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.evaluation_template', domain: 'errors'));
    }

    #[Route('/{publicId}/criterias', name: 'get_criterias', methods: ['GET'])]
    public function getCriterias(string $publicId): JsonResponse
    {
        $template = $this->getEvaluationTemplateByPublicId($publicId);

        return $this->createTemplateCriteriaResponse(EvaluationTemplateCriteriaDTO::fromEntities($template->getCriterias()));
    }

    #[Route('/{publicId}/criterias', name: 'post_criterias', methods: ['POST'])]
    public function postCriterias(Request $request, string $publicId): JsonResponse
    {
        $template = $this->getEvaluationTemplateByPublicId($publicId);
        $criterias = $request->getPayload()->all('criterias');
        if (count($criterias) > 0) {
            $this->dispatcher->dispatch(new EvaluationTemplateCreatedEvent(
                $template,
                $this->evaluationCriteriaRepository->findByIdsAndUser($criterias, $this->getUser())
            ));
        }

        return $this->createTemplateCriteriaResponse([
            'message' => $this->translator->trans('added.evaluation_template_criterias', ['%template%' => $template]),
        ]);
    }

    #[Route('/{publicId}/employees', name: 'get_employees', methods: ['GET'])]
    public function getEmployees(string $publicId): JsonResponse
    {
        $template = $this->getEvaluationTemplateByPublicId($publicId);

        return $this->createEmployeeResponse(EmployeeDTO::fromEntities($template->getEmployees()));
    }

    #[Route('/{publicId}/employees', name: 'post_employees', methods: ['POST'])]
    public function postEmployees(Request $request, string $publicId): JsonResponse
    {
        $template = $this->getEvaluationTemplateByPublicId($publicId);
        $employees = $request->getPayload()->all('employees');

        if (count($employees) > 0) {
            foreach ($this->employeeRepository->findByIdsAndUser($employees, $this->getUser()) as $employee) {
                $template->addEmployee($employee);
            }
            $this->evaluationTemplateRepository->update($template);
        }

        return $this->createEmployeeResponse([
            'message' => $this->translator->trans('added.evaluation_template_employees', ['%template%' => $template]),
        ]);
    }

    #[Route('/{publicId}/employees/{employeePublicId}', name: 'delete_employee', methods: ['DELETE'])]
    public function deleteEmployee(string $publicId, string $employeePublicId): JsonResponse
    {
        $template = $this->getEvaluationTemplateByPublicId($publicId);

        if (null !== $employee = $this->employeeRepository->findByPublicIdAndUser($employeePublicId, $this->getUser())) {
            $template->removeEmployee($employee);
        }

        $this->evaluationTemplateRepository->update($template);

        return $this->createEmployeeResponse([
            'message' => $this->translator->trans('deleted.evaluation_template_employee', ['%template%' => $template]),
        ]);
    }
}
