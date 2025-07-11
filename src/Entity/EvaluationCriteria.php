<?php
declare(strict_types=1);


namespace App\Entity;

use App\Repository\EvaluationCriteriaRepository;
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
    #[ORM\ManyToOne(inversedBy: 'criterias')]
    #[ORM\JoinColumn(nullable: false)]
    private ?EvaluationTemplate $template = null;

    #[ORM\Column(length: 255)]
    private ?string $label = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column]
    private int $weight = 1;

    /**
     * @return EvaluationTemplate|null
     */
    public function getTemplate(): ?EvaluationTemplate
    {
        return $this->template;
    }

    /**
     * @param EvaluationTemplate|null $template
     * @return EvaluationCriteria
     */
    public function setTemplate(?EvaluationTemplate $template): EvaluationCriteria
    {
        $this->template = $template;
        return $this;
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
}
