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
     * Find all payslips for an employee filtered by year.
     *
     * @param Employee $employee
     * @param int      $year
     * @return Payslip[]
     */
    public function findByEmployeeAndYear(Employee $employee, int $year): array
    {
        $start = new \DateTimeImmutable("$year-01-01");
        $end   = new \DateTimeImmutable("$year-12-31");

        return $this->createQueryBuilder('p')
            ->join('p.payrollRun', 'pr')
            ->where('p.employee = :employee')
            ->andWhere('pr.period >= :start')
            ->andWhere('pr.period <= :end')
            ->andWhere('p.deletedAt IS NULL')
            ->setParameter('employee', $employee)
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('pr.period', 'DESC')
            ->getQuery()
            ->getResult();
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
