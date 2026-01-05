<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\EvaluationTemplateRepository;
use App\Util\Canonicalizer;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class EvaluationTemplate.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_evaluation_templates')]
#[ORM\Entity(repositoryClass: EvaluationTemplateRepository::class)]
#[ORM\UniqueConstraint(name: 'UQ_EVALUATION_TEMPLATE_NAME', fields: ['name', 'workspace'])]
#[ORM\UniqueConstraint(name: 'UQ_EVALUATION_TEMPLATE_CANONICAL_NAME', fields: ['canonicalName', 'workspace'])]
#[ORM\HasLifecycleCallbacks]
class EvaluationTemplate extends AbstractEntity
{
    #[ORM\Column(length: 255)]
    #[Groups(['template:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Groups(['template:read'])]
    private ?string $canonicalName = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['template:read'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['template:read'])]
    private bool $active = true;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'templates')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    /**
     * @var Collection<int, EvaluationTemplateCriteria>
     */
    #[ORM\OneToMany(targetEntity: EvaluationTemplateCriteria::class, mappedBy: 'template', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $criterias;

    /**
     * @var Collection<int, Employee>
     */
    #[ORM\ManyToMany(targetEntity: Employee::class, mappedBy: 'templates')]
    private Collection $employees;

    #[ORM\ManyToOne(inversedBy: 'evaluationTemplates')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?Workspace $workspace = null;

    public function __construct()
    {
        $this->criterias = new ArrayCollection();
        $this->employees = new ArrayCollection();
    }

    /**
     * @return string|null
     */
    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * @param string|null $name
     * @return EvaluationTemplate
     */
    public function setName(?string $name): EvaluationTemplate
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getCanonicalName(): ?string
    {
        return $this->canonicalName;
    }

    /**
     * @param string|null $canonicalName
     * @return EvaluationTemplate
     */
    public function setCanonicalName(?string $canonicalName): EvaluationTemplate
    {
        $this->canonicalName = $canonicalName;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getDescription(): ?string
    {
        return $this->description;
    }

    /**
     * @param string|null $description
     * @return EvaluationTemplate
     */
    public function setDescription(?string $description): EvaluationTemplate
    {
        $this->description = $description;
        return $this;
    }

    /**
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->active;
    }

    /**
     * @param bool $active
     * @return EvaluationTemplate
     */
    public function setActive(bool $active): EvaluationTemplate
    {
        $this->active = $active;
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
     * @return EvaluationTemplate
     */
    public function setUser(?User $user): EvaluationTemplate
    {
        $this->user = $user;
        return $this;
    }
    /**
     * @return Collection<int, EvaluationTemplateCriteria>
     */
    public function getCriterias(): Collection
    {
        return $this->criterias;
    }

    /**
     * @param Collection<int, EvaluationTemplateCriteria> $criterias
     */
    public function setCriterias(Collection $criterias): EvaluationTemplate
    {
        $this->criterias = $criterias;

        return $this;
    }

    public function addCriteria(EvaluationTemplateCriteria $criteria): static
    {
        if (!$this->criterias->contains($criteria)) {
            $this->criterias->add($criteria);
            $criteria->setTemplate($this);
        }

        return $this;
    }

    public function removeCriteria(EvaluationTemplateCriteria $criteria): static
    {
        if ($this->criterias->removeElement($criteria) && $criteria->getTemplate() === $this) {
            $criteria->setTemplate(null);
        }

        return $this;
    }

    /**
     * @return Collection<int, Employee>
     */
    public function getEmployees(): Collection
    {
        return $this->employees;
    }

    /**
     * @param Collection<int, Employee> $employees
     */
    public function setEmployees(Collection $employees): EvaluationTemplate
    {
        $this->employees = $employees;

        return $this;
    }

    public function addEmployee(Employee $employee): static
    {
        if (!$this->employees->contains($employee)) {
            $this->employees->add($employee);
            $employee->addTemplate($this);
        }

        return $this;
    }

    public function removeEmployee(Employee $employee): static
    {
        if ($this->employees->removeElement($employee) && $employee->getTemplates()->contains($this)) {
            $employee->removeTemplate($this);
        }

        return $this;
    }

    public function __toString(): string
    {
        return $this->getName() ?? '';
    }

    /**
     * Canonicalizes the name of the evaluation template.
     * This method should be called before persisting the entity to ensure
     * that the canonical name is set correctly.
     */
    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function canonicalize(): void
    {
        $this->canonicalName = Canonicalizer::canonicalize($this->name);
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
}
