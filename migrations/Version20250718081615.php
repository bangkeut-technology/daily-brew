<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250718081615 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP FOREIGN KEY FK_1C4A4D253FC1CD0A');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP FOREIGN KEY FK_1C4A4D255DA0FB8');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP FOREIGN KEY FK_1C4A4D258C03F15C');
        $this->addSql('DROP INDEX IDX_1C4A4D253FC1CD0A ON daily_brew_employee_evaluations');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD template_name VARCHAR(255) NOT NULL, ADD evaluated_at DATE NOT NULL COMMENT \'(DC2Type:date_immutable)\', ADD notes LONGTEXT DEFAULT NULL, CHANGE template_id template_id INT UNSIGNED DEFAULT NULL, CHANGE rater_id evaluator_id INT UNSIGNED NOT NULL');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD CONSTRAINT FK_1C4A4D2543575BE2 FOREIGN KEY (evaluator_id) REFERENCES daily_brew_users (id)');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD CONSTRAINT FK_1C4A4D255DA0FB8 FOREIGN KEY (template_id) REFERENCES daily_brew_evaluation_templates (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD CONSTRAINT FK_1C4A4D258C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id)');
        $this->addSql('CREATE INDEX IDX_1C4A4D2543575BE2 ON daily_brew_employee_evaluations (evaluator_id)');
        $this->addSql('CREATE UNIQUE INDEX UQ_EMPLOYEE_EVALUATION ON daily_brew_employee_evaluations (evaluated_at, employee_id, template_name)');
        $this->addSql('ALTER TABLE daily_brew_employee_scores DROP FOREIGN KEY FK_4BEC1C03990BEA15');
        $this->addSql('ALTER TABLE daily_brew_employee_scores ADD criteria_label VARCHAR(255) NOT NULL, ADD weight INT NOT NULL, CHANGE criteria_id criteria_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_employee_scores ADD CONSTRAINT FK_4BEC1C03990BEA15 FOREIGN KEY (criteria_id) REFERENCES daily_brew_evaluation_template_criterias (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_employee_scores DROP FOREIGN KEY FK_4BEC1C03990BEA15');
        $this->addSql('ALTER TABLE daily_brew_employee_scores DROP criteria_label, DROP weight, CHANGE criteria_id criteria_id INT UNSIGNED NOT NULL');
        $this->addSql('ALTER TABLE daily_brew_employee_scores ADD CONSTRAINT FK_4BEC1C03990BEA15 FOREIGN KEY (criteria_id) REFERENCES daily_brew_evaluation_criterias (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP FOREIGN KEY FK_1C4A4D2543575BE2');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP FOREIGN KEY FK_1C4A4D258C03F15C');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP FOREIGN KEY FK_1C4A4D255DA0FB8');
        $this->addSql('DROP INDEX IDX_1C4A4D2543575BE2 ON daily_brew_employee_evaluations');
        $this->addSql('DROP INDEX UQ_EMPLOYEE_EVALUATION ON daily_brew_employee_evaluations');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP template_name, DROP evaluated_at, DROP notes, CHANGE template_id template_id INT UNSIGNED NOT NULL, CHANGE evaluator_id rater_id INT UNSIGNED NOT NULL');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD CONSTRAINT FK_1C4A4D253FC1CD0A FOREIGN KEY (rater_id) REFERENCES daily_brew_users (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD CONSTRAINT FK_1C4A4D258C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_users (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD CONSTRAINT FK_1C4A4D255DA0FB8 FOREIGN KEY (template_id) REFERENCES daily_brew_evaluation_templates (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_1C4A4D253FC1CD0A ON daily_brew_employee_evaluations (rater_id)');
    }
}
