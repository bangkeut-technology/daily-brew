<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260519120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add WorkspaceSetting.tap_checkin_enabled — owner opt-in to let employees check in from the mobile app without scanning a QR. IP / geofence / device verification still apply.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings ADD tap_checkin_enabled TINYINT(1) DEFAULT 0 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings DROP tap_checkin_enabled');
    }
}
