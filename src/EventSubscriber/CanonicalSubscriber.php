<?php

namespace App\EventSubscriber;

use App\Entity\ClosurePeriod;
use App\Entity\Employee;
use App\Entity\Shift;
use App\Entity\User;
use App\Entity\Workspace;
use App\Service\CanonicalizerService;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;

#[AsDoctrineListener(event: Events::prePersist)]
#[AsDoctrineListener(event: Events::preUpdate)]
final readonly class CanonicalSubscriber
{
    public function __construct(
        private CanonicalizerService $canonicalizer,
    ) {}

    public function prePersist(PrePersistEventArgs $args): void
    {
        $this->canonicalize($args->getObject());
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $this->canonicalize($args->getObject());
    }

    private function canonicalize(object $entity): void
    {
        if ($entity instanceof User) {
            $entity->setEmailCanonical(
                $this->canonicalizer->canonicalizeEmail($entity->getEmail()),
            );
        }

        if ($entity instanceof Workspace) {
            $entity->setNameCanonical(
                $this->canonicalizer->canonicalizeName($entity->getName()),
            );
        }

        if ($entity instanceof Employee) {
            $entity->setNameCanonical(
                $this->canonicalizer->canonicalizeName($entity->getName()),
            );
        }

        if ($entity instanceof Shift) {
            $entity->setNameCanonical(
                $this->canonicalizer->canonicalizeName($entity->getName()),
            );
        }

        if ($entity instanceof ClosurePeriod) {
            $entity->setNameCanonical(
                $this->canonicalizer->canonicalizeName($entity->getName()),
            );
        }
    }
}
