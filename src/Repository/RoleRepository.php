<?php
declare(strict_types=1);

namespace App\Repository;

use App\Entity\Role;
use App\Util\CanonicalizerInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Class RoleRepository
 *
 * @package App\Repository
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @extends ServiceEntityRepository<Role>
 *
 * @method Role      create()
 * @method Role|null find($id, $lockMode = null, $lockVersion = null)
 * @method Role|null findOneBy(array $criteria, array $orderBy = null)
 * @method Role[]    findAll()
 * @method Role[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class RoleRepository extends AbstractRepository
{
    private CanonicalizerInterface $canonicalizer;

    public function __construct(ManagerRegistry $registry, CanonicalizerInterface $canonicalizer)
    {
        parent::__construct($registry, Role::class);
        $this->canonicalizer = $canonicalizer;
    }

    /**
     * Update and canicalize the role name.
     *
     * @param Role $role The role entity to update.
     * @param bool $flush Whether to flush the changes to the database immediately.
     */
    public function updateRole(Role $role, bool $flush = true): void
    {
        $role->setCanonicalName($this->canonicalizer->canonicalizeString($role->getName()));

        $this->update($role, $flush);;

    }
}
