<?php
declare(strict_types=1);


namespace App\Entity;

use App\Repository\EvaluationCriteriaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class EvaluationCriteria
 *
 * @package App\Entity
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_evaluation_criterias')]
#[ORM\Entity(repositoryClass: EvaluationCriteriaRepository::class)]
class EvaluationCriteria extends AbstractEntity
{

    #[ORM\Column(length: 255)]
    private ?string $label = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column]
    private int $weight = 1;

    /**
     * @var Collection<int, EvaluationTemplateCriteria>
     */
    #[ORM\ManyToMany(targetEntity: EvaluationTemplateCriteria::class, inversedBy: 'criteria')]
    #[ORM\JoinColumn(nullable: false)]
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
     * @param EvaluationTemplateCriteria $template
     * @return EvaluationCriteria
     */
    public function addTemplate(EvaluationTemplateCriteria $template): EvaluationCriteria
    {
        if (!$this->templates->contains($template)) {
            $this->templates[] = $template;
        }
        return $this;
    }

    /**
     * @param EvaluationTemplateCriteria $template
     * @return EvaluationCriteria
     */
    public function removeTemplate(EvaluationTemplateCriteria $template): EvaluationCriteria
    {
        if ($this->templates->contains($template)) {
            $this->templates->removeElement($template);
        }
        return $this;
    }

}
