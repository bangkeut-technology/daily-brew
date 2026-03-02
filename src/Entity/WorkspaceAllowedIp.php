<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\WorkspaceAllowedIpRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class WorkspaceAllowedIp
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_workspace_allowed_ips')]
#[ORM\Entity(repositoryClass: WorkspaceAllowedIpRepository::class)]
class WorkspaceAllowedIp extends AbstractEntity
{
    #[ORM\ManyToOne(targetEntity: Workspace::class, inversedBy: 'allowedIps')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    #[ORM\Column(length: 45)]
    #[Groups(['workspace_allowed_ip:read'])]
    #[Assert\NotBlank]
    #[Assert\Ip(version: Assert\Ip::ALL)]
    private string $ip;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['workspace_allowed_ip:read'])]
    private ?string $label = null;

    #[ORM\Column]
    #[Groups(['workspace_allowed_ip:read'])]
    private bool $isActive = true;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(?Workspace $workspace): static
    {
        $this->workspace = $workspace;

        return $this;
    }

    public function getIp(): string
    {
        return $this->ip;
    }

    public function setIp(string $ip): static
    {
        $this->ip = $ip;

        return $this;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(?string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

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
