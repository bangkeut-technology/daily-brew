<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds the soft-void audit columns to attendances. A voided row is preserved
 * (so the historical check-in/out is auditable and the unique (employee, date)
 * slot stays held) but is excluded from dashboard stats, the BasilBook export,
 * and is grayed-out in the attendance log. A subsequent QR check-in or manual
 * entry on the same day resurrects the row by clearing these fields.
 *
 * voided_by_id uses ON DELETE SET NULL to mirror edited_by_id — deleting the
 * actor account preserves the audit trail (email snapshot keeps the trace).
 */
final class Version20260608130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Attendance soft-void audit columns (voided_at, voided_by, voided_by_email, void_reason).';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_attendances ADD voided_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', ADD voided_by_id INT DEFAULT NULL, ADD voided_by_email VARCHAR(180) DEFAULT NULL, ADD void_reason VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD CONSTRAINT FK_ATTENDANCE_VOIDED_BY FOREIGN KEY (voided_by_id) REFERENCES daily_brew_users (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_ATTENDANCE_VOIDED_BY ON daily_brew_attendances (voided_by_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_attendances DROP FOREIGN KEY FK_ATTENDANCE_VOIDED_BY');
        $this->addSql('DROP INDEX IDX_ATTENDANCE_VOIDED_BY ON daily_brew_attendances');
        $this->addSql('ALTER TABLE daily_brew_attendances DROP voided_at, DROP voided_by_id, DROP voided_by_email, DROP void_reason');
    }
}
