<?php
declare(strict_types=1);

namespace App\ApiController\Trait;

use App\Entity\Attendance;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Trait AttendanceTrait
 *
 * @package App\ApiController\Trait
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
trait AttendanceTrait
{
    /**
     * Create a JSON response for attendance data.
     *
     * @param mixed $data       The data to include in the response.
     * @param int   $statusCode The HTTP status code for the response, default is 200 OK.
     *
     * @return JsonResponse
     */
    private function createAttendanceResponse(mixed $data, int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return $this->json($data, $statusCode, context: ['groups' => ['attendance:read', 'employee:read', 'user:read']]);
    }

    /**
     * Retrieve an Attendance entity by its public ID and the current user.
     *
     * @param string $publicId The public ID of the attendance.
     *
     * @return Attendance The Attendance entity.
     * @throws NotFoundHttpException If the attendance is not found.
     */
    private function getAttendanceByPublicId(string $publicId): Attendance
    {
        if (null === $attendance = $this->attendanceRepository->findByPublicIdAndUser($publicId, $this->getUser())) {
            throw $this->createNotFoundException($this->translator->trans('not_found.attendance', ['%publicId%' => $publicId], domain: 'errors'));
        }

        return $attendance;
    }
}
