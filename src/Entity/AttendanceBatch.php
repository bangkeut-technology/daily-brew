<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\AttendanceBatchTypeEnum;
use App\Repository\AttendanceBatchRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class AttendanceBatch.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_attendance_batches')]
#[ORM\Entity(repositoryClass: AttendanceBatchRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_ATTENDANCE_BATCH_LABEL', fields: ['label', 'user'])]
#[ORM\UniqueConstraint(name: 'UNIQ_ATTENDANCE_BATCH_CANONICAL_LABEL', fields: ['canonicalLabel', 'user'])]
#[ORM\HasLifecycleCallbacks]
class AttendanceBatch extends AbstractEntity
{
    #[ORM\Column(enumType: AttendanceBatchTypeEnum::class)]
    private ?AttendanceBatchTypeEnum $type = null;

    #[ORM\Column(length: 255)]
    private ?string $label = null;

    #[ORM\Column(length: 255)]
    private ?string $canonicalLabel = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $note = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private ?\DateTimeImmutable $fromDate = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private ?\DateTimeImmutable $toDate = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $user = null;

    /**
     * @var Collection<int, Attendance>
     */
    #[ORM\OneToMany(targetEntity: Attendance::class, mappedBy: 'batch')]
    private Collection $attendances {
        get {
            return $this->attendances;
        }
    }

    /**
     * @return AttendanceBatchTypeEnum|null
     */
    public function getType(): ?AttendanceBatchTypeEnum
    {
        return $this->type;
    }

    /**
     * @param AttendanceBatchTypeEnum|null $type
     * @return AttendanceBatch
     */
    public function setType(?AttendanceBatchTypeEnum $type): AttendanceBatch
    {
        $this->type = $type;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getLabel(): ?string
    {
        return $this->label;
    }

    /**
     * @param string|null $label
     * @return AttendanceBatch
     */
    public function setLabel(?string $label): AttendanceBatch
    {
        $this->label = $label;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getCanonicalLabel(): ?string
    {
        return $this->canonicalLabel;
    }

    /**
     * @param string|null $canonicalLabel
     * @return AttendanceBatch
     */
    public function setCanonicalLabel(?string $canonicalLabel): AttendanceBatch
    {
        $this->canonicalLabel = $canonicalLabel;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getNote(): ?string
    {
        return $this->note;
    }

    /**
     * @param string|null $note
     * @return AttendanceBatch
     */
    public function setNote(?string $note): AttendanceBatch
    {
        $this->note = $note;
        return $this;
    }

    /**
     * @return \DateTimeImmutable|null
     */
    public function getFromDate(): ?\DateTimeImmutable
    {
        return $this->fromDate;
    }

    /**
     * @param \DateTimeImmutable|null $fromDate
     * @return AttendanceBatch
     */
    public function setFromDate(?\DateTimeImmutable $fromDate): AttendanceBatch
    {
        $this->fromDate = $fromDate;
        return $this;
    }

    /**
     * @return \DateTimeImmutable|null
     */
    public function getToDate(): ?\DateTimeImmutable
    {
        return $this->toDate;
    }

    /**
     * @param \DateTimeImmutable|null $toDate
     * @return AttendanceBatch
     */
    public function setToDate(?\DateTimeImmutable $toDate): AttendanceBatch
    {
        $this->toDate = $toDate;
        return $this;
    }

    /**
     * @return User|null
     */
    public function getUser(): ?User
    {
        return $this->user;
    }

    /**
     * @param User|null $user
     * @return AttendanceBatch
     */
    public function setUser(?User $user): AttendanceBatch
    {
        $this->user = $user;
        return $this;
    }

    public function __construct()
    {
        $this->attendances = new ArrayCollection();
    }

    public function addAttendance(Attendance $attendance): static
    {
        if (!$this->attendances->contains($attendance)) {
            $this->attendances->add($attendance);
            $attendance->setBatch($this);
        }

        return $this;
    }

    public function removeAttendance(Attendance $attendance): static
    {
        if ($this->attendances->removeElement($attendance)) {
            // set the owning side to null (unless already changed)
            if ($attendance->getBatch() === $this) {
                $attendance->setBatch(null);
            }
        }

        return $this;
    }
}
