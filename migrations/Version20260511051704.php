<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260511051704 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Employee.attendanceTracking enum column (full / none) for opting employees out of absent-count and discipline flags';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_employees ADD attendance_tracking VARCHAR(20) DEFAULT \'full\' NOT NULL, CHANGE manager_permissions manager_permissions JSON DEFAULT \'[]\' NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_employees DROP attendance_tracking, CHANGE manager_permissions manager_permissions JSON DEFAULT \'json_array()\' NOT NULL');
    }
}
