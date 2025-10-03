<?php
declare(strict_types=1);

namespace App\Seeder;

use App\Entity\EvaluationTemplateCriteria;
use App\Entity\User;
use App\Enum\EmployeeStatusEnum;
use App\Repository\EmployeeRepository;
use App\Repository\EvaluationCriteriaRepository;
use App\Repository\EvaluationTemplateRepository;
use DateTimeImmutable;
use Faker\Factory;

/**
 * Class DemoSeeder
 *
 * @package App\Seeder
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class DemoSeeder
{
    /**
     * @param EmployeeRepository           $employeeRepository
     * @param EvaluationTemplateRepository $evaluationTemplateRepository
     * @param EvaluationCriteriaRepository $evaluationCriteriaRepository
     */
    public function __construct(
        private EmployeeRepository           $employeeRepository,
        private EvaluationTemplateRepository $evaluationTemplateRepository,
        private EvaluationCriteriaRepository $evaluationCriteriaRepository,
    )
    {
    }

    public function seedFor(User $user): void
    {
        $faker = Factory::create();
        $template = $this->evaluationTemplateRepository->create()
            ->setName('Waiter\'s KPI')
            ->setUser($user)
            ->setDescription('This is a demo template for waiters to evaluate their performance.');
        for ($i = 0; $i < 5; $i++) {
            $employee = $this->employeeRepository->create()
                ->setUser($user)
                ->setDob(DateTimeImmutable::createFromMutable($faker->dateTimeBetween('-60 years', '-18 years')))
                ->setJoinedAt(DateTimeImmutable::createFromMutable($faker->dateTimeBetween('-2 years')))
                ->setFirstName($faker->firstName())
                ->setLastName($faker->lastName())
                ->setStatus(EmployeeStatusEnum::ACTIVE)
                ->setPhoneNumber($faker->phoneNumber());
            $this->employeeRepository->update($employee);
            $template->addEmployee($employee);
        }

        $criteriaLabel = [
            'Customer Service',
            'Order Accuracy',
            'Speed of Service',
            'Menu Knowledge',
            'Cleanliness',
            'Teamwork'
        ];
        foreach ($criteriaLabel as $label) {
            $criteria = $this->evaluationCriteriaRepository->create()
                ->setLabel($label)
                ->setWeight($faker->numberBetween(1, 5))
                ->setDescription($faker->sentence());
            $this->evaluationCriteriaRepository->update($criteria);
            $template->addCriteria(new EvaluationTemplateCriteria(
                $criteria->getWeight(),
                $template,
                $criteria,
            ));
        }

        $this->evaluationTemplateRepository->update($template);
    }
}
