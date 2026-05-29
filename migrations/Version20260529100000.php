<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds `telegram_chat_id` to the users table so users can receive personal
 * Telegram notifications (leave decisions, shift assignments, daily summaries
 * for owners/managers) independently of the workspace-scoped group chat
 * configured in WorkspaceSetting.
 *
 * Populated by the /start <token> Telegram webhook flow after the user taps
 * "Connect personal Telegram" on the profile page; nullable because most
 * users won't link Telegram and we don't require it.
 */
final class Version20260529100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add telegram_chat_id column to daily_brew_users for per-user personal Telegram notifications.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_users ADD telegram_chat_id VARCHAR(64) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_users DROP telegram_chat_id');
    }
}
