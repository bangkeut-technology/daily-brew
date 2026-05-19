<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260519130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add WorkspaceSetting.nfc_checkin_enabled — owner opt-in distinct from tap_checkin_enabled. Tap = open app + button; NFC = touch tag (no app required on iPhone XS+).';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings ADD nfc_checkin_enabled TINYINT(1) DEFAULT 0 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings DROP nfc_checkin_enabled');
    }
}
