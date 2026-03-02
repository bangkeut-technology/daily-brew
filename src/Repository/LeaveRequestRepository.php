<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\LeaveRequest;
use App\Entity\Workspace;
use App\Enum\LeaveRequestStatusEnum;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class LeaveRequestRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends AbstractRepository<LeaveRequest>
 *
 * @method LeaveRequest      create()
 * @method LeaveRequest|null find($id, $lockMode = null, $lockVersion = null)
 * @method LeaveRequest|null findOneBy(array $criteria, array $orderBy = null)
 * @method LeaveRequest|null findByPublicId(string $publicId)
 * @method LeaveRequest[]    findAll()
 * @method LeaveRequest[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class LeaveRequestRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LeaveRequest::class);
    }

    /**
     * Find all leave requests for an employee.
     *
     * @param Employee $employee
     * @return LeaveRequest[]
     */
    public function findByEmployee(Employee $employee): array
    {
        return $this->findBy(['employee' => $employee, 'deletedAt' => null], ['createdAt' => 'DESC']);
    }

    /**
     * Find all leave requests for a workspace.
     *
     * @param Workspace $workspace
     * @return LeaveRequest[]
     */
    public function findByWorkspace(Workspace $workspace): array
    {
        return $this->findBy(['workspace' => $workspace, 'deletedAt' => null], ['createdAt' => 'DESC']);
    }

    /**
     * Find all pending leave requests for a workspace.
     *
     * @param Workspace $workspace
     * @return LeaveRequest[]
     */
    public function findPendingByWorkspace(Workspace $workspace): array
    {
        return $this->findBy(
            ['workspace' => $workspace, 'status' => LeaveRequestStatusEnum::PENDING, 'deletedAt' => null],
            ['createdAt' => 'DESC']
        );
    }

    /**
     * Find a leave request by its public ID and workspace.
     *
     * @param string    $publicId
     * @param Workspace $workspace
     * @return LeaveRequest|null
     */
    public function findByPublicIdAndWorkspace(string $publicId, Workspace $workspace): ?LeaveRequest
    {
        return $this->findOneBy(['publicId' => $publicId, 'workspace' => $workspace, 'deletedAt' => null]);
    }

    /**
     * Find a leave request by its public ID and employee.
     *
     * @param string   $publicId
     * @param Employee $employee
     * @return LeaveRequest|null
     */
    public function findByPublicIdAndEmployee(string $publicId, Employee $employee): ?LeaveRequest
    {
        return $this->findOneBy(['publicId' => $publicId, 'employee' => $employee, 'deletedAt' => null]);
    }
}
