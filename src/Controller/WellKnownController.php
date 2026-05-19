<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\MobileAppConfigRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Serves the iOS Universal Links and Android App Links manifest files so
 * tapping a `https://dailybrew.work/checkin/...` link (from an NFC sticker,
 * email, QR code, etc.) opens the DailyBrew mobile app directly when it's
 * installed. Values come from the singleton App\Entity\MobileAppConfig
 * managed by super-admins at /admin/mobile-app-config.
 */
class WellKnownController extends AbstractController
{
    public function __construct(
        private readonly MobileAppConfigRepository $configRepository,
    ) {
    }

    /**
     * Apple Universal Links manifest. iOS fetches this once per app install
     * (via Apple's CDN, not directly) and caches it. Path must match exactly
     * `/.well-known/apple-app-site-association` and the response must be
     * served as JSON over HTTPS with no redirects.
     */
    #[Route(
        path: '/.well-known/apple-app-site-association',
        name: 'well_known_aasa',
        methods: ['GET'],
        format: 'json',
    )]
    public function appleAppSiteAssociation(): JsonResponse
    {
        $config = $this->configRepository->getOrCreate();

        $details = [];
        if ($config->isIosConfigured()) {
            $details[] = [
                'appIDs' => [sprintf('%s.%s', $config->getIosTeamId(), $config->getIosBundleId())],
                // /checkin/<token> (main QR) and /checkin/qr/<token> (sub-QR)
                'components' => [
                    ['/' => '/checkin/*'],
                ],
            ];
        }

        // Apple's documented "applinks" envelope. `details` may be an empty
        // array if iOS isn't configured yet — iOS treats that as "no apps
        // claim this domain" and just opens the URL in Safari, which is
        // the correct fallback.
        $payload = [
            'applinks' => [
                'details' => $details,
            ],
        ];

        $response = new JsonResponse($payload);
        $response->headers->set('Content-Type', 'application/json');
        // AASA is cached aggressively by iOS / Apple's CDN, so a long
        // browser-cache TTL is fine and reduces churn.
        $response->headers->set('Cache-Control', 'public, max-age=3600');
        return $response;
    }

    /**
     * Android App Links manifest. Google verifies this at install time when
     * `android:autoVerify="true"` is set on the intent filter. Path must be
     * served from `/.well-known/assetlinks.json` over HTTPS.
     */
    #[Route(
        path: '/.well-known/assetlinks.json',
        name: 'well_known_assetlinks',
        methods: ['GET'],
        format: 'json',
    )]
    public function androidAssetLinks(): JsonResponse
    {
        $config = $this->configRepository->getOrCreate();

        $entries = [];
        if ($config->isAndroidConfigured()) {
            $entries[] = [
                'relation' => ['delegate_permission/common.handle_all_urls'],
                'target' => [
                    'namespace' => 'android_app',
                    'package_name' => $config->getAndroidPackage(),
                    'sha256_cert_fingerprints' => $config->getAndroidSha256Fingerprints() ?? [],
                ],
            ];
        }

        $response = new JsonResponse($entries);
        $response->headers->set('Content-Type', 'application/json');
        $response->headers->set('Cache-Control', 'public, max-age=3600');
        return $response;
    }
}
