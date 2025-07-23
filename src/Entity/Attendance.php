<?php
declare(strict_types=1);


namespace App\Entity;


use App\Enum\AttendanceStatusEnum;
use App\Repository\AttendanceRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;


/**
 * Class Attendance
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_attendances')]
#[ORM\Entity(repositoryClass: AttendanceRepository::class)]
class Attendance extends AbstractEntity
{
    #[ORM\Column(length: 255)]
    private ?string $identifier = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private ?\DateTimeImmutable $attendanceDate = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $note = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $clockIn = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $clockOut = null;

    #[ORM\Column(enumType: AttendanceStatusEnum::class)]
    private AttendanceStatusEnum $status = AttendanceStatusEnum::PRESENT;

    #[ORM\ManyToOne(inversedBy: 'attendances')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Employee $employee = null;

    public function getIdentifier(): ?string
    {
        return $this->identifier;
    }

    public function setIdentifier(string $identifier): static
    {
        $this->identifier = $identifier;

        return $this;
    }

    public function getAttendanceDate(): ?\DateTimeImmutable
    {
        return $this->attendanceDate;
    }

    public function setAttendanceDate(\DateTimeImmutable $attendanceDate): static
    {
        $this->attendanceDate = $attendanceDate;

        return $this;
    }

    public function getNote(): ?string
    {
        return $this->note;
    }

    public function setNote(?string $note): static
    {
        $this->note = $note;

        return $this;
    }

    public function getClockIn(): ?\DateTimeImmutable
    {
        return $this->clockIn;
    }

    public function setClockIn(?\DateTimeImmutable $clockIn): static
    {
        $this->clockIn = $clockIn;

        return $this;
    }

    public function getClockOut(): ?\DateTimeImmutable
    {
        return $this->clockOut;
    }

    public function setClockOut(?\DateTimeImmutable $clockOut): static
    {
        $this->clockOut = $clockOut;

        return $this;
    }

    public function getStatus(): ?AttendanceStatusEnum
    {
        return $this->status;
    }

    public function setStatus(AttendanceStatusEnum $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getEmployee(): ?Employee
    {
        return $this->employee;
    }

    public function setEmployee(?Employee $employee): static
    {
        $this->employee = $employee;

        return $this;
    }
}
