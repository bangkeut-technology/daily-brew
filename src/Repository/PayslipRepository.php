<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\Payslip;
use App\Entity\PayrollRun;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class PayslipRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends AbstractRepository<Payslip>
 *
 * @method Payslip      create()
 * @method Payslip|null find($id, $lockMode = null, $lockVersion = null)
 * @method Payslip|null findOneBy(array $criteria, array $orderBy = null)
 * @method Payslip|null findByPublicId(string $publicId)
 * @method Payslip[]    findAll()
 * @method Payslip[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PayslipRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Payslip::class);
    }

    /**
     * Find all payslips for a payroll run.
     *
     * @param PayrollRun $payrollRun
     * @return Payslip[]
     */
    public function findByPayrollRun(PayrollRun $payrollRun): array
    {
        return $this->findBy(['payrollRun' => $payrollRun]);
    }

    /**
     * Find all payslips for an employee.
     *
     * @param Employee $employee
     * @return Payslip[]
     */
    public function findByEmployee(Employee $employee): array
    {
        return $this->findBy(['employee' => $employee]);
    }

    /**
     * Find a payslip by public ID and payroll run.
     *
     * @param string     $publicId
     * @param PayrollRun $payrollRun
     * @return Payslip|null
     */
    public function findByPublicIdAndPayrollRun(string $publicId, PayrollRun $payrollRun): ?Payslip
    {
        return $this->findOneBy([
            'publicId' => $publicId,
            'payrollRun' => $payrollRun,
        ]);
    }
}
