<?php
declare(strict_types=1);

namespace App\ApiController\Trait;

use App\Entity\Attendance;
use App\Entity\AttendanceBatch;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Trait AttendanceBatchTrait
 *
 * @package App\ApiController\Trait
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
trait AttendanceBatchTrait
{
    /**
     * Create a JSON response for attendance batch data.
     *
     * @param mixed $data       The data to include in the response.
     * @param int   $statusCode The HTTP status code for the response, default is 200 OK.
     *
     * @return JsonResponse
     */
    private function createAttendanceBatchResponse(mixed $data, int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return $this->json($data, $statusCode, context: ['groups' => ['attendance_batch:read']]);
    }

    /**
     * Retrieve an Attendance batch entity by its public ID and the current user.
     *
     * @param string $publicId The public ID of the attendance.
     *
     * @return AttendanceBatch The Attendance batch entity.
     * @throws NotFoundHttpException If the attendance is not found.
     */
    private function getAttendanceBatchByPublicId(string $publicId): AttendanceBatch
    {
        if (null === $batch = $this->attendanceBatchRepository->findByPublicIdAndUser($publicId, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.attendance_batch', ['%publicId%' => $publicId], domain: 'errors'));
        }

        return $batch;
    }
}
