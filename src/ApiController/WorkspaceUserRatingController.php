<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\WorkspaceTrait;
use App\Controller\AbstractController;
use App\Enum\ApiErrorCodeEnum;
use App\Form\WorkspaceUserRatingFormType;
use App\Repository\UserRepository;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceUserRatingRepository;
use App\Repository\WorkspaceUserRepository;
use App\Security\Voter\WorkspaceVoter;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class WorkspaceUserRatingController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/workspaces/{publicId}/ratings', name: 'workspace_ratings_')]
#[OA\Tag(name: 'Workspace Rating')]
class WorkspaceUserRatingController extends AbstractController
{
    use WorkspaceTrait;

    public function __construct(
        TranslatorInterface                          $translator,
        private readonly WorkspaceRepository         $workspaceRepository,
        private readonly WorkspaceUserRatingRepository $ratingRepository,
        private readonly WorkspaceUserRepository     $workspaceUserRepository,
        private readonly UserRepository              $userRepository,
    )
    {
        parent::__construct($translator);
    }

    #[Route(name: 'list', methods: ['GET'])]
    public function list(string $publicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::RATE_MEMBER, $workspace);

        $ratings = $this->ratingRepository->findByWorkspace($workspace);

        return $this->json($ratings, Response::HTTP_OK, [], ['groups' => ['workspace_user_rating:read']]);
    }

    #[Route(name: 'create', methods: ['POST'])]
    public function create(string $publicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::RATE_MEMBER, $workspace);

        $payload = $request->getPayload();
        $revieweePublicId = $payload->get('revieweePublicId');

        if (empty($revieweePublicId)) {
            return $this->createBadRequestResponse('revieweePublicId is required');
        }

        $reviewee = $this->userRepository->findByPublicId($revieweePublicId);
        if (null === $reviewee) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $revieweePublicId]);
        }

        $reviewer = $this->getUser();

        if ($reviewer === $reviewee) {
            return $this->json(['message' => 'You cannot rate yourself.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!$this->workspaceUserRepository->isMember($workspace, $reviewee)) {
            return $this->json(['message' => 'The reviewee is not a member of this workspace.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $rating = $this->ratingRepository->create();
        $rating->setReviewer($reviewer);
        $rating->setReviewee($reviewee);
        $rating->setWorkspace($workspace);

        $form = $this->createForm(WorkspaceUserRatingFormType::class, $rating);
        $form->submit($payload->all());

        if ($form->isSubmitted() && $form->isValid()) {
            $this->ratingRepository->update($rating);

            return $this->json($rating, Response::HTTP_CREATED, [], ['groups' => ['workspace_user_rating:read']]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.workspace_user_rating', domain: 'errors'));
    }

    #[Route('/{ratingPublicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId, string $ratingPublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::RATE_MEMBER, $workspace);

        $rating = $this->ratingRepository->findByPublicIdAndWorkspace($ratingPublicId, $workspace);
        if (null === $rating) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $ratingPublicId]);
        }

        return $this->json($rating, Response::HTTP_OK, [], ['groups' => ['workspace_user_rating:read']]);
    }

    #[Route('/{ratingPublicId}', name: 'update', methods: ['PUT'])]
    public function update(string $publicId, string $ratingPublicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::RATE_MEMBER, $workspace);

        $rating = $this->ratingRepository->findByPublicIdAndWorkspace($ratingPublicId, $workspace);
        if (null === $rating) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $ratingPublicId]);
        }

        $form = $this->createForm(WorkspaceUserRatingFormType::class, $rating);
        $form->submit($request->getPayload()->all(), false);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->ratingRepository->update($rating);

            return $this->json($rating, Response::HTTP_OK, [], ['groups' => ['workspace_user_rating:read']]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.workspace_user_rating', domain: 'errors'));
    }

    #[Route('/{ratingPublicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId, string $ratingPublicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::RATE_MEMBER, $workspace);

        $rating = $this->ratingRepository->findByPublicIdAndWorkspace($ratingPublicId, $workspace);
        if (null === $rating) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $ratingPublicId]);
        }

        $this->ratingRepository->delete($rating);

        return $this->json(['message' => 'Rating deleted.'], Response::HTTP_OK);
    }
}
