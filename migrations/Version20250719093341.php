<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250719093341 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD identifier VARCHAR(255) NOT NULL, CHANGE notes note LONGTEXT DEFAULT NULL, CHANGE average average_score DOUBLE PRECISION NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UQ_EMPLOYEE_EVALUATION_IDENTIFIER ON daily_brew_employee_evaluations (identifier)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UQ_EMPLOYEE_EVALUATION_IDENTIFIER ON daily_brew_employee_evaluations');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP identifier, CHANGE average_score average DOUBLE PRECISION NOT NULL, CHANGE note notes LONGTEXT DEFAULT NULL');
    }
}
