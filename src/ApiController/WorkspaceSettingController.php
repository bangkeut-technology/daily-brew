<?php

declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\WorkspaceTrait;
use App\Constant\WorkspaceSettingConstant;
use App\Controller\AbstractController;
use App\Enum\ApiErrorCodeEnum;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceSettingRepository;
use App\Security\Voter\WorkspaceVoter;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class WorkspaceSettingController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/workspaces/{publicId}/settings', name: 'workspace_settings_')]
#[OA\Tag(name: 'Workspace Settings')]
class WorkspaceSettingController extends AbstractController
{
    use WorkspaceTrait;

    public function __construct(
        TranslatorInterface                         $translator,
        private readonly WorkspaceRepository        $workspaceRepository,
        private readonly WorkspaceSettingRepository $settingRepository,
    ) {
        parent::__construct($translator);
    }

    #[Route(name: 'list', methods: ['GET'])]
    public function list(string $publicId): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SETTINGS, $workspace);

        $defaults = WorkspaceSettingConstant::getConstantsWithDefaults();

        $dbRows = $this->settingRepository->findByWorkspace($workspace);
        foreach ($dbRows as $row) {
            $defaults[$row->getName()] = $row->getValue();
        }

        return $this->json($defaults);
    }

    #[Route(name: 'bulk_update', methods: ['PATCH'])]
    public function bulkUpdate(string $publicId, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SETTINGS, $workspace);

        $payload = $request->getPayload()->all();
        $validKeys = array_keys(WorkspaceSettingConstant::getConstantsWithDefaults());

        foreach ($payload as $key => $value) {
            if (!in_array($key, $validKeys, true)) {
                continue;
            }

            $setting = $this->settingRepository->findByNameAndWorkspace($key, $workspace);
            if (null === $setting) {
                $setting = $this->settingRepository->create();
                $setting->setName($key);
                $setting->setWorkspace($workspace);
            }

            $setting->setValue((string) $value);
            $this->settingRepository->update($setting, false);
        }

        $this->settingRepository->flush();

        $defaults = WorkspaceSettingConstant::getConstantsWithDefaults();
        $dbRows = $this->settingRepository->findByWorkspace($workspace);
        foreach ($dbRows as $row) {
            $defaults[$row->getName()] = $row->getValue();
        }

        return $this->json($defaults);
    }

    #[Route('/{name}', name: 'get', methods: ['GET'])]
    public function get(string $publicId, string $name): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SETTINGS, $workspace);

        $validKeys = array_keys(WorkspaceSettingConstant::getConstantsWithDefaults());
        if (!in_array($name, $validKeys, true)) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $name]);
        }

        $setting = $this->settingRepository->findByNameAndWorkspace($name, $workspace);
        $value = $setting?->getValue() ?? WorkspaceSettingConstant::getDefaultValue($name);

        return $this->json([$name => $value]);
    }

    #[Route('/{name}', name: 'update', methods: ['PATCH'])]
    public function update(string $publicId, string $name, Request $request): JsonResponse
    {
        $workspace = $this->getWorkspaceByPublicId($publicId);
        $this->denyAccessUnlessGranted(WorkspaceVoter::MANAGE_SETTINGS, $workspace);

        $validKeys = array_keys(WorkspaceSettingConstant::getConstantsWithDefaults());
        if (!in_array($name, $validKeys, true)) {
            throw $this->createApiErrorException(ApiErrorCodeEnum::NOT_FOUND, ['%publicId%' => $name]);
        }

        $value = $request->getPayload()->get('value');
        if (null === $value) {
            return $this->createBadRequestResponse('Missing "value" field.');
        }

        $setting = $this->settingRepository->findByNameAndWorkspace($name, $workspace);
        if (null === $setting) {
            $setting = $this->settingRepository->create();
            $setting->setName($name);
            $setting->setWorkspace($workspace);
        }

        $setting->setValue((string) $value);
        $this->settingRepository->update($setting);

        return $this->json([$name => $setting->getValue()]);
    }
}
