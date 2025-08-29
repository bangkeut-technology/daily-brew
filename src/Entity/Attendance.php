<?php
declare(strict_types=1);


namespace App\Entity;


use App\Enum\AttendanceStatusEnum;
use App\Repository\AttendanceRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;


/**
 * Class Attendance
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_attendances')]
#[ORM\Entity(repositoryClass: AttendanceRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_ATTENDANCE_EMPLOYEE_DATE', fields: ['employee', 'attendanceDate'])]
class Attendance extends AbstractEntity
{
    /**
     * The date of the attendance.
     *
     * @var DateTimeImmutable|null
     */
    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups(['attendance:read'])]
    private ?DateTimeImmutable $attendanceDate = null;

    /**
     * A note for the attendance.
     *
     * @var string|null
     */
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['attendance:read'])]
    private ?string $note = null;

    /**
     * The time the employee clocked in.
     *
     * @var DateTimeImmutable|null
     */
    #[ORM\Column(nullable: true)]
    #[Groups(['attendance:read'])]
    private ?DateTimeImmutable $clockIn = null;

    /**
     * The time the employee clocked out.
     *
     * @var DateTimeImmutable|null
     */
    #[ORM\Column(nullable: true)]
    #[Groups(['attendance:read'])]
    private ?DateTimeImmutable $clockOut = null;

    /**
     * The status of the attendance.
     *
     * @var AttendanceStatusEnum
     */
    #[ORM\Column(enumType: AttendanceStatusEnum::class)]
    #[Groups(['attendance:read'])]
    private AttendanceStatusEnum $status = AttendanceStatusEnum::PRESENT;

    /**
     * The employee associated with this attendance.
     *
     * @var Employee|null
     */
    #[ORM\ManyToOne(targetEntity: Employee::class, inversedBy: 'attendances')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['attendance:read'])]
    private ?Employee $employee = null;

    /**
     * The user who created or modified this attendance record.
     *
     * @var User|null
     */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['attendance:read'])]
    private ?User $user = null;

    /**
     * @return DateTimeImmutable|null
     */
    public function getAttendanceDate(): ?DateTimeImmutable
    {
        return $this->attendanceDate;
    }

    /**
     * @param DateTimeImmutable|null $attendanceDate
     * @return Attendance
     */
    public function setAttendanceDate(?DateTimeImmutable $attendanceDate): Attendance
    {
        $this->attendanceDate = $attendanceDate;
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
     * @return Attendance
     */
    public function setNote(?string $note): Attendance
    {
        $this->note = $note;
        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getClockIn(): ?DateTimeImmutable
    {
        return $this->clockIn;
    }

    /**
     * @param DateTimeImmutable|null $clockIn
     * @return Attendance
     */
    public function setClockIn(?DateTimeImmutable $clockIn): Attendance
    {
        $this->clockIn = $clockIn;
        return $this;
    }

    /**
     * @return DateTimeImmutable|null
     */
    public function getClockOut(): ?DateTimeImmutable
    {
        return $this->clockOut;
    }

    /**
     * @param DateTimeImmutable|null $clockOut
     * @return Attendance
     */
    public function setClockOut(?DateTimeImmutable $clockOut): Attendance
    {
        $this->clockOut = $clockOut;
        return $this;
    }

    /**
     * @return AttendanceStatusEnum
     */
    public function getStatus(): AttendanceStatusEnum
    {
        return $this->status;
    }

    /**
     * @param AttendanceStatusEnum $status
     * @return Attendance
     */
    public function setStatus(AttendanceStatusEnum $status): Attendance
    {
        $this->status = $status;
        return $this;
    }

    /**
     * @return Employee|null
     */
    public function getEmployee(): ?Employee
    {
        return $this->employee;
    }

    /**
     * @param Employee|null $employee
     * @return Attendance
     */
    public function setEmployee(?Employee $employee): Attendance
    {
        $this->employee = $employee;
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
     * @return Attendance
     */
    public function setUser(?User $user): Attendance
    {
        $this->user = $user;
        return $this;
    }
}
