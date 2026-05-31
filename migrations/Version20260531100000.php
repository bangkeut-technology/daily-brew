<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds WorkspaceSetting.push_checkin_alerts_enabled — the Expo push analogue
 * of telegram_checkin_alerts_enabled. Same semantics, off by default,
 * Espresso-gated server-side via PlanService::canUseTelegramNotifications
 * (the alerts feature umbrella, not Telegram-specific).
 */
final class Version20260531100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add WorkspaceSetting.push_checkin_alerts_enabled — owner gets an Expo push on every employee check-in/out when on.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings ADD push_checkin_alerts_enabled TINYINT(1) DEFAULT 0 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings DROP push_checkin_alerts_enabled');
    }
}
