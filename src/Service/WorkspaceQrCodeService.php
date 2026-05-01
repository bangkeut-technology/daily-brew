<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Employee;
use App\Entity\Workspace;
use App\Entity\WorkspaceQrCode;
use App\Repository\EmployeeRepository;
use App\Repository\WorkspaceQrCodeRepository;
use InvalidArgumentException;

class WorkspaceQrCodeService
{
    public function __construct(
        private readonly WorkspaceQrCodeRepository $qrCodeRepository,
        private readonly EmployeeRepository $employeeRepository,
        private readonly PlanService $planService,
    ) {}

    /**
     * @param array{
     *   name: string,
     *   managerPublicId?: ?string,
     *   assignedEmployeePublicIds?: array<int, string>,
     *   inheritIpSettings?: bool,
     *   ipRestrictionEnabled?: bool,
     *   allowedIps?: ?array<int, string>,
     *   inheritGeofencing?: bool,
     *   geofencingEnabled?: bool,
     *   geofencingLatitude?: ?float,
     *   geofencingLongitude?: ?float,
     *   geofencingRadiusMeters?: ?int,
     *   inheritDeviceVerification?: bool,
     *   deviceVerificationEnabled?: bool,
     * } $data
     */
    public function create(Workspace $workspace, array $data): WorkspaceQrCode
    {
        $this->assertPlan($workspace);

        $name = trim((string) ($data['name'] ?? ''));
        if ($name === '') {
            throw new InvalidArgumentException('QR code name is required');
        }

        $qrCode = new WorkspaceQrCode();
        $qrCode->setWorkspace($workspace);
        $qrCode->setName($name);

        $this->applyManager($qrCode, $workspace, $data);
        $this->applyAssignments($qrCode, $workspace, $data);
        $this->applySettings($qrCode, $data);

        $this->qrCodeRepository->persist($qrCode);
        $this->qrCodeRepository->flush();

        return $qrCode;
    }

    /**
     * @param array<string, mixed> $data Partial update.
     */
    public function update(WorkspaceQrCode $qrCode, array $data): WorkspaceQrCode
    {
        $workspace = $qrCode->getWorkspace();
        if ($workspace === null) {
            throw new InvalidArgumentException('QR code is not attached to a workspace');
        }
        $this->assertPlan($workspace);

        if (array_key_exists('name', $data)) {
            $name = trim((string) $data['name']);
            if ($name === '') {
                throw new InvalidArgumentException('QR code name cannot be empty');
            }
            $qrCode->setName($name);
        }

        if (array_key_exists('managerPublicId', $data)) {
            $this->applyManager($qrCode, $workspace, $data);
        }

        if (array_key_exists('assignedEmployeePublicIds', $data)) {
            $this->applyAssignments($qrCode, $workspace, $data);
        }

        $this->applySettings($qrCode, $data);

        $this->qrCodeRepository->flush();

        return $qrCode;
    }

    public function delete(WorkspaceQrCode $qrCode): void
    {
        $this->qrCodeRepository->delete($qrCode);
    }

    private function assertPlan(Workspace $workspace): void
    {
        if (!$this->planService->canUseSubQrCodes($workspace)) {
            throw new InvalidArgumentException('Multiple QR codes require the Double Espresso plan');
        }
    }

    /** @param array<string, mixed> $data */
    private function applyManager(WorkspaceQrCode $qrCode, Workspace $workspace, array $data): void
    {
        $publicId = $data['managerPublicId'] ?? null;
        if ($publicId === null || $publicId === '') {
            $qrCode->setManager(null);
            return;
        }

        $manager = $this->employeeRepository->findByPublicId((string) $publicId);
        if (!$manager instanceof Employee || $manager->getWorkspace()?->getId() !== $workspace->getId()) {
            throw new InvalidArgumentException('Manager must be an employee of this workspace');
        }
        if ($manager->getLinkedUser() === null) {
            throw new InvalidArgumentException('Manager must have a linked user account');
        }

        $qrCode->setManager($manager);
    }

    /** @param array<string, mixed> $data */
    private function applyAssignments(WorkspaceQrCode $qrCode, Workspace $workspace, array $data): void
    {
        $publicIds = $data['assignedEmployeePublicIds'] ?? [];
        if (!is_array($publicIds)) {
            throw new InvalidArgumentException('assignedEmployeePublicIds must be an array');
        }

        // Reset assignments
        foreach ($qrCode->getAssignedEmployees()->toArray() as $existing) {
            $qrCode->removeAssignedEmployee($existing);
        }

        foreach ($publicIds as $publicId) {
            $employee = $this->employeeRepository->findByPublicId((string) $publicId);
            if (!$employee instanceof Employee || $employee->getWorkspace()?->getId() !== $workspace->getId()) {
                throw new InvalidArgumentException('Assigned employees must belong to this workspace');
            }
            $qrCode->addAssignedEmployee($employee);
        }
    }

    /** @param array<string, mixed> $data */
    private function applySettings(WorkspaceQrCode $qrCode, array $data): void
    {
        // IP cluster
        if (array_key_exists('inheritIpSettings', $data)) {
            $qrCode->setInheritIpSettings((bool) $data['inheritIpSettings']);
        }
        if (array_key_exists('ipRestrictionEnabled', $data)) {
            $qrCode->setIpRestrictionEnabled((bool) $data['ipRestrictionEnabled']);
        }
        if (array_key_exists('allowedIps', $data)) {
            $allowed = $data['allowedIps'];
            $qrCode->setAllowedIps(is_array($allowed) ? array_values(array_map('strval', $allowed)) : null);
        }

        // Geofence cluster
        if (array_key_exists('inheritGeofencing', $data)) {
            $qrCode->setInheritGeofencing((bool) $data['inheritGeofencing']);
        }
        if (array_key_exists('geofencingEnabled', $data)) {
            $qrCode->setGeofencingEnabled((bool) $data['geofencingEnabled']);
        }
        if (array_key_exists('geofencingLatitude', $data)) {
            $qrCode->setGeofencingLatitude($data['geofencingLatitude'] !== null ? (float) $data['geofencingLatitude'] : null);
        }
        if (array_key_exists('geofencingLongitude', $data)) {
            $qrCode->setGeofencingLongitude($data['geofencingLongitude'] !== null ? (float) $data['geofencingLongitude'] : null);
        }
        if (array_key_exists('geofencingRadiusMeters', $data)) {
            $radius = $data['geofencingRadiusMeters'];
            $qrCode->setGeofencingRadiusMeters($radius !== null ? max((int) $radius, 50) : null);
        }

        // Device cluster
        if (array_key_exists('inheritDeviceVerification', $data)) {
            $qrCode->setInheritDeviceVerification((bool) $data['inheritDeviceVerification']);
        }
        if (array_key_exists('deviceVerificationEnabled', $data)) {
            $qrCode->setDeviceVerificationEnabled((bool) $data['deviceVerificationEnabled']);
        }
    }
}
