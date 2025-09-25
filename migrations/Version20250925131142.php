<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250925131142 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_employee_attendance_batches (attendance_batch_id INT UNSIGNED NOT NULL, employee_id INT UNSIGNED NOT NULL, INDEX IDX_5CAC43841D9718B8 (attendance_batch_id), INDEX IDX_5CAC43848C03F15C (employee_id), PRIMARY KEY(attendance_batch_id, employee_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE daily_brew_employee_attendance_batches ADD CONSTRAINT FK_5CAC43841D9718B8 FOREIGN KEY (attendance_batch_id) REFERENCES daily_brew_attendance_batches (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_employee_attendance_batches ADD CONSTRAINT FK_5CAC43848C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_employee_attendance_batches DROP FOREIGN KEY FK_5CAC43841D9718B8');
        $this->addSql('ALTER TABLE daily_brew_employee_attendance_batches DROP FOREIGN KEY FK_5CAC43848C03F15C');
        $this->addSql('DROP TABLE daily_brew_employee_attendance_batches');
    }
}
