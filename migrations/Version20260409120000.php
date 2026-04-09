<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260409120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Telegram notification columns to workspace settings';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings ADD telegram_notifications_enabled TINYINT(1) DEFAULT 0 NOT NULL, ADD telegram_chat_id VARCHAR(64) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings DROP telegram_notifications_enabled, DROP telegram_chat_id');
    }
}
