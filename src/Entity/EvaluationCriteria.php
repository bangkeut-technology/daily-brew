<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\EvaluationCriteriaRepository;
use App\Util\Canonicalizer;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class EvaluationCriteria.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_evaluation_criterias')]
#[ORM\Entity(repositoryClass: EvaluationCriteriaRepository::class)]
#[ORM\UniqueConstraint(name: 'UQ_EVALUATION_CRITERIA_LABEL', columns: ['label', 'user_id'])]
#[ORM\UniqueConstraint(name: 'UQ_EVALUATION_CRITERIA_CANONICAL_LABEL', columns: ['canonical_label', 'user_id'])]
class EvaluationCriteria extends AbstractEntity
{
    /**
     * @var string|null
     */
    #[ORM\Column(length: 255)]
    #[Groups(['criteria:read'])]
    private ?string $label = null;

    /**
     * @var string|null
     */
    #[ORM\Column(length: 255)]
    #[Groups(['criteria:read'])]
    private ?string $canonicalLabel = null;

    /**
     * @var string|null
     */
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['criteria:read'])]
    private ?string $description = null;

    /**
     * @var int
     */
    #[ORM\Column]
    #[Groups(['criteria:read'])]
    private int $weight = 1;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'criterias')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    /**
     * @var Collection<int, EvaluationTemplateCriteria>
     */
    #[ORM\OneToMany(targetEntity: EvaluationTemplateCriteria::class, mappedBy: 'criteria', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $templates;

    public function __construct()
    {
        $this->templates = new ArrayCollection();
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
     * @return EvaluationCriteria
     */
    public function setLabel(?string $label): EvaluationCriteria
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
     * @return EvaluationCriteria
     */
    public function setCanonicalLabel(?string $canonicalLabel): EvaluationCriteria
    {
        $this->canonicalLabel = $canonicalLabel;
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
     * @return EvaluationCriteria
     */
    public function setDescription(?string $description): EvaluationCriteria
    {
        $this->description = $description;
        return $this;
    }

    /**
     * @return int
     */
    public function getWeight(): int
    {
        return $this->weight;
    }

    /**
     * @param int $weight
     * @return EvaluationCriteria
     */
    public function setWeight(int $weight): EvaluationCriteria
    {
        $this->weight = $weight;
        return $this;
    }

    /**
     * @return Collection<int, EvaluationTemplateCriteria>
     */
    public function getTemplates(): Collection
    {
        return $this->templates;
    }

    /**
     * @param Collection<int, EvaluationTemplateCriteria> $templates
     * @return EvaluationCriteria
     */
    public function setTemplates(Collection $templates): EvaluationCriteria
    {
        $this->templates = $templates;

        return $this;
    }

    public function addTemplate(EvaluationTemplateCriteria $template): EvaluationCriteria
    {
        if (!$this->templates->contains($template)) {
            $this->templates[] = $template;
        }

        return $this;
    }

    public function removeTemplate(EvaluationTemplateCriteria $template): EvaluationCriteria
    {
        if ($this->templates->contains($template)) {
            $this->templates->removeElement($template);
        }

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
     * @return EvaluationCriteria
     */
    public function setUser(?User $user): EvaluationCriteria
    {
        $this->user = $user;
        return $this;
    }

    /**
     * Returns a string representation of the EvaluationCriteria.
     *
     * @return string
     */
    public function __toString(): string
    {
        return $this->getLabel() ?? 'Evaluation Criteria';
    }

    /**
     * Canonicalizes the label of the criteria.
     * This method should be implemented to convert the label into a canonical form.
     *
     * @return void
     */
    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function canonicalize(): void
    {
        $this->canonicalLabel = Canonicalizer::canonicalize($this->label);
    }
}
