<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Payslip;
use App\Entity\PayslipItem;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class PayslipItemRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends AbstractRepository<PayslipItem>
 *
 * @method PayslipItem      create()
 * @method PayslipItem|null find($id, $lockMode = null, $lockVersion = null)
 * @method PayslipItem|null findOneBy(array $criteria, array $orderBy = null)
 * @method PayslipItem|null findByPublicId(string $publicId)
 * @method PayslipItem[]    findAll()
 * @method PayslipItem[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PayslipItemRepository extends AbstractRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PayslipItem::class);
    }

    /**
     * Find a payslip item by public ID and payslip.
     *
     * @param string  $publicId
     * @param Payslip $payslip
     * @return PayslipItem|null
     */
    public function findByPublicIdAndPayslip(string $publicId, Payslip $payslip): ?PayslipItem
    {
        return $this->findOneBy([
            'publicId' => $publicId,
            'payslip' => $payslip,
        ]);
    }
}
