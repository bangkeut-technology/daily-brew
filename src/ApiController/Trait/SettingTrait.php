<?php
declare(strict_types=1);

namespace App\ApiController\Trait;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Trait SettingTrait
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
trait SettingTrait
{
    /**
     * Create a setting response
     *
     * @param mixed $data   The list of settings
     * @param int   $status The status code
     *
     * @return JsonResponse
     */
    private function createSettingResponse(mixed $data, int $status = Response::HTTP_OK): JsonResponse
    {
        return $this->json($data, $status, context: ['groups' => ['setting:read']]);
    }
}