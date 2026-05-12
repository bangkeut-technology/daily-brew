<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260512090000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Employee.left_at — timestamp captured when an employee is deactivated, so historical attendance still surfaces for days they were active.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_employees ADD left_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_employees DROP left_at');
    }
}
