<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\WorkspaceSettingRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class WorkspaceSetting
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_workspace_settings')]
#[ORM\Entity(repositoryClass: WorkspaceSettingRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_WORKSPACE_SETTING_NAME', fields: ['name', 'workspace'])]
class WorkspaceSetting extends AbstractEntity
{
    #[ORM\Column(length: 255)]
    #[Groups(['workspace_setting:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['workspace_setting:read'])]
    private ?string $value = null;

    #[ORM\ManyToOne(targetEntity: Workspace::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): WorkspaceSetting
    {
        $this->name = $name;
        return $this;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(?string $value): WorkspaceSetting
    {
        $this->value = $value;
        return $this;
    }

    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(?Workspace $workspace): WorkspaceSetting
    {
        $this->workspace = $workspace;
        return $this;
    }
}
