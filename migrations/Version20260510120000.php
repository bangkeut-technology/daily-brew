<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260510120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add manager_permissions JSON column to employees and backfill existing managers with default capabilities (manage_leave, manage_attendance).';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("ALTER TABLE daily_brew_employees ADD manager_permissions JSON NOT NULL DEFAULT (JSON_ARRAY())");
        // Back-fill: existing managers keep the rights they had implicitly before this migration.
        $this->addSql("UPDATE daily_brew_employees SET manager_permissions = JSON_ARRAY('manage_leave', 'manage_attendance') WHERE role = 'manager'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_employees DROP manager_permissions');
    }
}
