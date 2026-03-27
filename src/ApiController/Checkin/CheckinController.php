<?php

declare(strict_types=1);

namespace App\ApiController\Checkin;

use App\ApiController\Trait\ApiResponseTrait;
use App\Repository\EmployeeRepository;
use App\Service\CheckinService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

class CheckinController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('/checkin/{publicId}', name: 'checkin_status', methods: ['GET'])]
    public function status(
        string $publicId,
        EmployeeRepository $employeeRepository,
        CheckinService $checkinService,
    ): JsonResponse {
        $employee = $employeeRepository->findByPublicId($publicId);
        if ($employee === null || !$employee->isActive()) {
            throw new NotFoundHttpException('Invalid check-in link');
        }

        $attendance = $checkinService->getStatus($employee);
        $shift = $employee->getShift();

        return $this->jsonSuccess([
            'employeeName' => $employee->getName(),
            'shiftName' => $shift?->getName(),
            'shiftStart' => $shift?->getStartTime()?->format('H:i'),
            'shiftEnd' => $shift?->getEndTime()?->format('H:i'),
            'today' => [
                'checkedIn' => $attendance?->getCheckInAt() !== null,
                'checkedOut' => $attendance?->getCheckOutAt() !== null,
                'checkInAt' => $attendance?->getCheckInAt()?->format('H:i'),
                'checkOutAt' => $attendance?->getCheckOutAt()?->format('H:i'),
                'isLate' => $attendance?->isLate() ?? false,
            ],
        ]);
    }

    #[Route('/checkin/{publicId}', name: 'checkin_action', methods: ['POST'])]
    public function checkin(
        string $publicId,
        Request $request,
        EmployeeRepository $employeeRepository,
        CheckinService $checkinService,
    ): JsonResponse {
        $employee = $employeeRepository->findByPublicId($publicId);
        if ($employee === null || !$employee->isActive()) {
            throw new NotFoundHttpException('Invalid check-in link');
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $latitude = isset($data['latitude']) ? (float) $data['latitude'] : null;
        $longitude = isset($data['longitude']) ? (float) $data['longitude'] : null;

        $attendance = $checkinService->checkin(
            $employee,
            $request->getClientIp() ?? '',
            $latitude,
            $longitude,
        );

        return $this->jsonSuccess([
            'checkInAt' => $attendance->getCheckInAt()?->format('H:i'),
            'checkOutAt' => $attendance->getCheckOutAt()?->format('H:i'),
            'isLate' => $attendance->isLate(),
            'leftEarly' => $attendance->hasLeftEarly(),
        ]);
    }
}
