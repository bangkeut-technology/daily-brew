<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds per-row audit columns to attendances so owners/managers can override
 * forgotten check-outs (and other typos) while preserving the original scan data.
 *
 *  - edited_at / edited_by_id / edited_by_email / edit_reason: who/when/why
 *  - original_check_in_at / original_check_out_at: snapshot captured ONCE on
 *    first edit so subsequent edits never lose the raw scan
 */
final class Version20260521120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add manager-override audit columns to daily_brew_attendances.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_attendances
            ADD edited_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            ADD edited_by_id INT DEFAULT NULL,
            ADD edited_by_email VARCHAR(180) DEFAULT NULL,
            ADD edit_reason VARCHAR(255) DEFAULT NULL,
            ADD original_check_in_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            ADD original_check_out_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');

        $this->addSql('ALTER TABLE daily_brew_attendances
            ADD CONSTRAINT FK_ATTENDANCE_EDITED_BY FOREIGN KEY (edited_by_id)
            REFERENCES daily_brew_users (id) ON DELETE SET NULL');

        $this->addSql('CREATE INDEX IDX_ATTENDANCE_EDITED_BY ON daily_brew_attendances (edited_by_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_attendances DROP FOREIGN KEY FK_ATTENDANCE_EDITED_BY');
        $this->addSql('DROP INDEX IDX_ATTENDANCE_EDITED_BY ON daily_brew_attendances');
        $this->addSql('ALTER TABLE daily_brew_attendances
            DROP edited_at,
            DROP edited_by_id,
            DROP edited_by_email,
            DROP edit_reason,
            DROP original_check_in_at,
            DROP original_check_out_at');
    }
}
