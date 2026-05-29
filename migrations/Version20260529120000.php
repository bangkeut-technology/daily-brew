<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds a per-workspace opt-in toggle for live check-in/out Telegram alerts.
 *
 * The existing `telegram_notifications_enabled` controls leave/shift/closure
 * notifications — events that happen a few times per week. Every-punch
 * alerts are a different noise profile entirely (a 5-person café = 10+
 * pings/day), so they need their own switch defaulted off so we never
 * surprise an existing Telegram user with a flood of new messages.
 *
 * Plan gating is the same Espresso+ check as the rest of Telegram
 * notifications (PlanService::canUseTelegramNotifications), enforced
 * server-side in WorkspaceSettingController::update.
 */
final class Version20260529120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add WorkspaceSetting.telegram_checkin_alerts_enabled (default false) — owner opt-in for live per-punch Telegram pings.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings ADD telegram_checkin_alerts_enabled TINYINT(1) DEFAULT 0 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings DROP telegram_checkin_alerts_enabled');
    }
}
