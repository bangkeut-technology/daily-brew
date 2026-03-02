<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\WorkspaceUserRatingRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class WorkspaceUserRating
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_workspace_user_ratings')]
#[ORM\Entity(repositoryClass: WorkspaceUserRatingRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_RATING_PAIR_PERIOD', fields: ['reviewer', 'reviewee', 'workspace', 'period'])]
class WorkspaceUserRating extends AbstractEntity
{
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['workspace_user_rating:read'])]
    private ?User $reviewer = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['workspace_user_rating:read'])]
    private ?User $reviewee = null;

    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    #[ORM\Column(type: Types::SMALLINT)]
    #[Groups(['workspace_user_rating:read'])]
    #[Assert\Range(min: 1, max: 5)]
    private int $score;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['workspace_user_rating:read'])]
    private ?string $comment = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: true)]
    #[Groups(['workspace_user_rating:read'])]
    private ?DateTimeImmutable $period = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    public function getReviewer(): ?User
    {
        return $this->reviewer;
    }

    public function setReviewer(?User $reviewer): static
    {
        $this->reviewer = $reviewer;

        return $this;
    }

    public function getReviewee(): ?User
    {
        return $this->reviewee;
    }

    public function setReviewee(?User $reviewee): static
    {
        $this->reviewee = $reviewee;

        return $this;
    }

    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(?Workspace $workspace): static
    {
        $this->workspace = $workspace;

        return $this;
    }

    public function getScore(): int
    {
        return $this->score;
    }

    public function setScore(int $score): static
    {
        $this->score = $score;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;

        return $this;
    }

    public function getPeriod(): ?DateTimeImmutable
    {
        return $this->period;
    }

    public function setPeriod(?DateTimeImmutable $period): static
    {
        $this->period = $period;

        return $this;
    }

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?DateTimeImmutable $deletedAt): static
    {
        $this->deletedAt = $deletedAt;

        return $this;
    }
}
