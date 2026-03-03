<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\DayOfWeekEnum;
use App\Repository\ShiftTimeRuleRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class ShiftTimeRule
 *
 * A single day-of-week schedule entry for a Shift (e.g. Monday 07:00–14:00).
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_shift_time_rules')]
#[ORM\Entity(repositoryClass: ShiftTimeRuleRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_SHIFT_DAY', fields: ['shift', 'dayOfWeek'])]
class ShiftTimeRule extends AbstractEntity
{
    #[ORM\ManyToOne(targetEntity: Shift::class, inversedBy: 'timeRules')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Shift $shift = null;

    #[ORM\Column(enumType: DayOfWeekEnum::class)]
    private DayOfWeekEnum $dayOfWeek;

    /** Format: HH:MM (e.g. "07:00") */
    #[ORM\Column(length: 5)]
    private string $startTime;

    /** Format: HH:MM (e.g. "14:00") */
    #[ORM\Column(length: 5)]
    private string $endTime;

    public function getShift(): ?Shift
    {
        return $this->shift;
    }

    public function setShift(?Shift $shift): static
    {
        $this->shift = $shift;

        return $this;
    }

    public function getDayOfWeek(): DayOfWeekEnum
    {
        return $this->dayOfWeek;
    }

    public function setDayOfWeek(DayOfWeekEnum $dayOfWeek): static
    {
        $this->dayOfWeek = $dayOfWeek;

        return $this;
    }

    public function getStartTime(): string
    {
        return $this->startTime;
    }

    public function setStartTime(string $startTime): static
    {
        $this->startTime = $startTime;

        return $this;
    }

    public function getEndTime(): string
    {
        return $this->endTime;
    }

    public function setEndTime(string $endTime): static
    {
        $this->endTime = $endTime;

        return $this;
    }
}
