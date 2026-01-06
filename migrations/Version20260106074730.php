<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260106074730 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_attendance_batches ADD deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE daily_brew_employees ADD deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE daily_brew_evaluation_criterias ADD deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE daily_brew_evaluation_templates ADD deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE daily_brew_stores ADD deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE daily_brew_users CHANGE deleted_at deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE daily_brew_workspace_users ADD deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE daily_brew_workspaces ADD deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_attendance_batches DROP deleted_at');
        $this->addSql('ALTER TABLE daily_brew_attendances DROP deleted_at');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP deleted_at');
        $this->addSql('ALTER TABLE daily_brew_employees DROP deleted_at');
        $this->addSql('ALTER TABLE daily_brew_evaluation_criterias DROP deleted_at');
        $this->addSql('ALTER TABLE daily_brew_evaluation_templates DROP deleted_at');
        $this->addSql('ALTER TABLE daily_brew_stores DROP deleted_at');
        $this->addSql('ALTER TABLE daily_brew_users CHANGE deleted_at deleted_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_workspace_users DROP deleted_at');
        $this->addSql('ALTER TABLE daily_brew_workspaces DROP deleted_at');
    }
}
