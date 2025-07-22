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
class EvaluationTemplateCriteria extends AbstractEntity
{
    #[ORM\Column]
    #[Groups(['template_criteria:read'])]
    private ?int $weight = null;

    #[ORM\ManyToOne(targetEntity: EvaluationTemplate::class, inversedBy: 'criterias')]
    #[Groups(['template_criteria:read'])]
    private ?EvaluationTemplate $template = null;

    #[ORM\ManyToOne(targetEntity: EvaluationCriteria::class, inversedBy: 'templates')]
    #[Groups(['template_criteria:read'])]
    private ?EvaluationCriteria $criteria = null;

    public function getWeight(): ?int
    {
        return $this->weight;
    }

    public function setWeight(?int $weight): EvaluationTemplateCriteria
    {
        $this->weight = $weight;

        return $this;
    }

    public function getTemplate(): ?EvaluationTemplate
    {
        return $this->template;
    }

    public function setTemplate(?EvaluationTemplate $template): EvaluationTemplateCriteria
    {
        $this->template = $template;

        return $this;
    }

    public function getCriteria(): ?EvaluationCriteria
    {
        return $this->criteria;
    }

    public function setCriteria(?EvaluationCriteria $criteria): EvaluationTemplateCriteria
    {
        $this->criteria = $criteria;

        return $this;
    }
}
