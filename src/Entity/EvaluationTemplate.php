<?php
declare(strict_types=1);


namespace App\Entity;

use App\Repository\EvaluationTemplateRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class EvaluationTemplate
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_evaluation_templates')]
#[ORM\Entity(repositoryClass: EvaluationTemplateRepository::class)]
#[ORM\UniqueConstraint(name: 'UQ_EVALUATION_TEMPLATE_NAME', columns: ['name', 'user'])]
#[ORM\UniqueConstraint(name: 'UQ_EVALUATION_TEMPLATE_CANONICAL_NAME', columns: ['canonical_name', 'user'])]
#[ORM\UniqueConstraint(name: 'UQ_EVALUATION_TEMPLATE_IDENTIFIER', columns: ['identifier'])]
class EvaluationTemplate extends AbstractEntity
{
    #[ORM\Column]
    #[Groups(['evaluation_template:read'])]
    private ?string $identifier = null;

    #[ORM\Column(length: 255)]
    #[Groups(['evaluation_template:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Groups(['evaluation_template:read'])]
    private ?string $canonicalName = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['evaluation_template:read'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['evaluation_template:read'])]
    private bool $active = true;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    /**
     * @var Collection<int, EvaluationCriteria>
     */
    #[ORM\OneToMany(targetEntity: EvaluationCriteria::class, mappedBy: 'template', orphanRemoval: true)]
    private Collection $criterias;

    public function __construct()
    {
        $this->criterias = new ArrayCollection();
    }

    /**
     * @return string|null
     */
    public function getIdentifier(): ?string
    {
        return $this->identifier;
    }

    /**
     * @param string|null $identifier
     * @return EvaluationTemplate
     */
    public function setIdentifier(?string $identifier): EvaluationTemplate
    {
        $this->identifier = $identifier;
        return $this;
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

    public function isActive(): bool
    {
        return $this->active;
    }

    public function setActive(bool $active): static
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
     * @return Collection<int, EvaluationCriteria>
     */
    public function getCriterias(): Collection
    {
        return $this->criterias;
    }

    /**
     * @param Collection<int, EvaluationCriteria> $criterias
     * @return EvaluationTemplate
     */
    public function setCriterias(Collection $criterias): EvaluationTemplate
    {
        $this->criterias = $criterias;

        return $this;
    }

    public function addCriteria(EvaluationCriteria $criteria): static
    {
        if (!$this->criterias->contains($criteria)) {
            $this->criterias->add($criteria);
            $criteria->setTemplate($this);
        }

        return $this;
    }

    public function removeCriteria(EvaluationCriteria $criteria): static
    {
        if ($this->criterias->removeElement($criteria)) {
            // set the owning side to null (unless already changed)
            if ($criteria->getTemplate() === $this) {
                $criteria->setTemplate(null);
            }
        }

        return $this;
    }
}
