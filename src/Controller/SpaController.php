<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\Seo\SeoMetaResolver;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class SpaController extends AbstractController
{
    #[Route('/{reactRouting}', name: 'app_spa', requirements: ['reactRouting' => '(?!api).*'], priority: -1)]
    public function index(
        Request $request,
        SeoMetaResolver $seoMetaResolver,
        int $maxFreeEmployees,
        string $contactEmail,
        string $googleClientId,
        string $appleClientId,
        string $paddleEnvironment,
        string $paddleClientSideToken,
        string $paddlePriceIdEspressoMonthly,
        string $paddlePriceIdEspressoAnnual,
        string $paddlePriceIdDoubleEspressoMonthly,
        string $paddlePriceIdDoubleEspressoAnnual,
        string $gaMeasurementId,
        string $telegramBotUsername,
    ): Response {
        $seo = $seoMetaResolver->resolve($request->getPathInfo());

        $response = $this->render('page/index.html.twig', [
            'maxFreeEmployees' => $maxFreeEmployees,
            'contactEmail' => $contactEmail,
            'googleClientId' => $googleClientId,
            'appleClientId' => $appleClientId,
            'paddleEnvironment' => $paddleEnvironment,
            'paddleClientSideToken' => $paddleClientSideToken,
            'paddlePriceIdEspressoMonthly' => $paddlePriceIdEspressoMonthly,
            'paddlePriceIdEspressoAnnual' => $paddlePriceIdEspressoAnnual,
            'paddlePriceIdDoubleEspressoMonthly' => $paddlePriceIdDoubleEspressoMonthly,
            'paddlePriceIdDoubleEspressoAnnual' => $paddlePriceIdDoubleEspressoAnnual,
            'gaMeasurementId' => $gaMeasurementId,
            'telegramBotUsername' => $telegramBotUsername,
            'user' => null,
            'metaTitle' => $seo->title,
            'metaDescription' => $seo->description,
            'canonicalUrl' => $seo->canonical,
            'ogUrl' => $seo->canonical ?? SeoMetaResolver::BASE_URL.'/',
            'robots' => $seo->robots(),
        ]);

        $response->setStatusCode($seo->statusCode);

        return $response;
    }
}
