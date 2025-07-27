<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\EvaluationTemplateCriteriaRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Class EvaluationTemplateCriteria.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[ORM\Table(name: 'daily_brew_evaluation_template_criterias')]
#[ORM\Entity(repositoryClass: EvaluationTemplateCriteriaRepository::class)]
#[ORM\UniqueConstraint(name: 'UQ_EVALUATION_TEMPLATE_CRITERIA_IDENTIFIER', columns: ['identifier'])]
class EvaluationTemplateCriteria extends AbstractEntity
{
    #[ORM\Column(length: 32)]
    #[Groups(['template_criteria:read'])]
    private ?string $identifier = null;

    #[ORM\Column]
    #[Groups(['template_criteria:read'])]
    private ?int $weight = null;

    #[ORM\ManyToOne(targetEntity: EvaluationTemplate::class, inversedBy: 'criterias')]
    #[Groups(['template_criteria:read'])]
    private ?EvaluationTemplate $template = null;

    #[ORM\ManyToOne(targetEntity: EvaluationCriteria::class, inversedBy: 'templates')]
    #[Groups(['template_criteria:read'])]
    private ?EvaluationCriteria $criteria = null;

    /**
     * @return string|null
     */
    public function getIdentifier(): ?string
    {
        return $this->identifier;
    }

    /**
     * @param string|null $identifier
     * @return EvaluationTemplateCriteria
     */
    public function setIdentifier(?string $identifier): EvaluationTemplateCriteria
    {
        $this->identifier = $identifier;
        return $this;
    }

    /**
     * @return int|null
     */
    public function getWeight(): ?int
    {
        return $this->weight;
    }

    /**
     * @param int|null $weight
     * @return EvaluationTemplateCriteria
     */
    public function setWeight(?int $weight): EvaluationTemplateCriteria
    {
        $this->weight = $weight;
        return $this;
    }

    /**
     * @return EvaluationTemplate|null
     */
    public function getTemplate(): ?EvaluationTemplate
    {
        return $this->template;
    }

    /**
     * @param EvaluationTemplate|null $template
     * @return EvaluationTemplateCriteria
     */
    public function setTemplate(?EvaluationTemplate $template): EvaluationTemplateCriteria
    {
        $this->template = $template;
        return $this;
    }

    /**
     * @return EvaluationCriteria|null
     */
    public function getCriteria(): ?EvaluationCriteria
    {
        return $this->criteria;
    }

    /**
     * @param EvaluationCriteria|null $criteria
     * @return EvaluationTemplateCriteria
     */
    public function setCriteria(?EvaluationCriteria $criteria): EvaluationTemplateCriteria
    {
        $this->criteria = $criteria;
        return $this;
    }
}
