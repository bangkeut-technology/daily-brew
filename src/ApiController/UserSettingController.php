<?php
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\SettingTrait;
use App\Controller\AbstractController;
use App\Entity\UserSetting;
use App\Repository\UserSettingRepository;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class UserSettingController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/users/settings', name: 'setting_')]
#[OA\Tag(name: 'User Setting')]
class UserSettingController extends AbstractController
{
    use SettingTrait;

    /**
     * SettingController constructor.
     *
     * @param TranslatorInterface   $translator        The translator service
     * @param UserSettingRepository $settingRepository The setting repository
     */
    public function __construct(
        TranslatorInterface                    $translator,
        private readonly UserSettingRepository $settingRepository,
    )
    {
        parent::__construct($translator);
    }

    /**
     * Get all settings
     *
     * @return JsonResponse
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Get all settings',
        content: new OA\JsonContent(
            description: 'The list of settings',
            properties: [
                new OA\Property(property: 'settingName', type: 'string'),
                new OA\Property(property: 'settingValue', type: 'string'),
            ],
            type: 'object'
        )
    )]
    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(): JsonResponse
    {
        $settings = [];
        foreach ($this->settingRepository->findByUser($this->getUser()) as $setting) {
            $settings[$setting->getName()] = $setting->getValue();
        }

        return $this->createSettingResponse($settings);
    }

    /**
     * Update settings
     *
     * @param Request $request The request object
     *
     * @return JsonResponse
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Update settings',
        content: new OA\JsonContent(
            description: 'The list of updated settings',
            type: 'array',
            items: new OA\Items(
                ref: new Model(type: UserSetting::class, groups: ['setting:read'])
            )
        )
    )]
    #[Route(name: 'patch', methods: ['PATCH'])]
    public function patch(Request $request): JsonResponse
    {
        $payload = $request->getPayload()->all();
        $settingNames = array_keys($payload);
        $user = $this->getUser();

        // Load existing settings
        $existingSettings = $this->settingRepository->findByNamesAndUser($settingNames, $user);
        $settingsByName = [];
        foreach ($existingSettings as $setting) {
            $settingsByName[$setting->getName()] = $setting;
        }

        $settings = [];

        foreach ($payload as $name => $value) {
            if (isset($settingsByName[$name])) {
                $setting = $settingsByName[$name];
                $setting->setValue($value);
            } else {
                $setting = new UserSetting()
                    ->setName($name)
                    ->setValue($value)
                    ->setUser($user);
                $this->settingRepository->update($setting, false);
            }

            $settings[] = $setting;
        }

        $this->settingRepository->flush();

        return $this->createSettingResponse([
            'message' => $this->translator->trans('updated.settings'),
            'settings' => $settings
        ]);
    }

    /**
     * Get a setting value
     *
     * @param string $name The name of the setting
     * @return JsonResponse
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Get a setting value',
        content: new OA\JsonContent(
            description: 'The value of the setting',
            type: 'string'
        )
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'UserSetting not found',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string')
            ]
        )
    )]
    #[OA\Response(
        response: Response::HTTP_FORBIDDEN,
        description: 'Access Denied if the setting is VAT rate or exchange rate',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string')
            ]
        )
    )]
    #[Route('/{name}', name: 'get', methods: ['GET'])]
    public function get(string $name): JsonResponse
    {
        $settingName = str_replace('-', '_', $name);

        if (null === $setting = $this->settingRepository->findByNameAndUser($settingName, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.setting', ['%name%' => $settingName], domain: 'errors'));
        }

        return $this->createSettingResponse($setting);
    }

    /**
     * Update settings
     *
     * @param string  $name       The name of the setting
     * @param Request $request    The request object
     *
     * @return JsonResponse
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Update settings',
        content: new OA\JsonContent(
            description: 'The list of updated settings',
            type: 'array',
            items: new OA\Items(
                ref: new Model(type: UserSetting::class, groups: ['setting:read'])
            )
        )
    )]
    #[Route('/{name}', name: 'patch_name', methods: ['PATCH'])]
    public function patchName(string $name, Request $request): JsonResponse
    {
        $settingName = str_replace('-', '_', $name);
        if (null === $setting = $this->settingRepository->findByNameAndUser($settingName, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.setting', ['%name%' => $name], domain: 'errors'));
        }

        $value = $request->getPayload()->get('value');
        $setting->setValue($value);

        $this->settingRepository->update($setting);

        return $this->createSettingResponse([
            'message' => $this->translator->trans('updated.setting', ['%name%' => $name]),
            'setting' => $setting
        ]);
    }
}
