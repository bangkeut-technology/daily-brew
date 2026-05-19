<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Cron infrastructure ported from Adora:
 *   - `scheduled_command` (dukecity bundle) — stores per-job cron expressions
 *   - `daily_brew_admin_cron_runs` — audit history populated by CronRunSubscriber
 *
 * Both consumed by /admin/cron and the system crontab entry
 * `php bin/console scheduler:execute` (one-line, fires every minute).
 */
final class Version20260519170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add scheduled_command (dukecity) + daily_brew_admin_cron_runs (audit) for the admin cron console.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE daily_brew_admin_cron_runs (
            id INT AUTO_INCREMENT NOT NULL,
            public_id VARCHAR(36) NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            command VARCHAR(200) NOT NULL,
            started_at DATETIME NOT NULL,
            finished_at DATETIME DEFAULT NULL,
            status VARCHAR(16) NOT NULL,
            exit_code SMALLINT DEFAULT NULL,
            output_tail LONGTEXT DEFAULT NULL,
            triggered_by_id INT DEFAULT NULL,
            UNIQUE INDEX UNIQ_ADMIN_CRON_RUNS_PUBLIC_ID (public_id),
            INDEX IDX_ADMIN_CRON_RUNS_TRIGGERED_BY (triggered_by_id),
            INDEX idx_cron_run_command_started (command, started_at),
            PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4');

        $this->addSql('CREATE TABLE scheduled_command (
            id INT AUTO_INCREMENT NOT NULL,
            version INT DEFAULT 1 NOT NULL,
            created_at DATETIME DEFAULT NULL,
            name VARCHAR(150) NOT NULL,
            command VARCHAR(200) NOT NULL,
            arguments LONGTEXT DEFAULT NULL,
            cron_expression VARCHAR(200) DEFAULT NULL,
            last_execution DATETIME DEFAULT NULL,
            last_return_code INT DEFAULT NULL,
            log_file VARCHAR(150) DEFAULT NULL,
            priority INT NOT NULL,
            execute_immediately TINYINT NOT NULL,
            disabled TINYINT NOT NULL,
            locked TINYINT NOT NULL,
            ping_back_url VARCHAR(255) DEFAULT NULL,
            ping_back_failed_url VARCHAR(255) DEFAULT NULL,
            notes LONGTEXT NOT NULL,
            UNIQUE INDEX UNIQ_SCHEDULED_COMMAND_NAME (name),
            PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4');

        $this->addSql('ALTER TABLE daily_brew_admin_cron_runs ADD CONSTRAINT FK_ADMIN_CRON_RUNS_TRIGGERED_BY FOREIGN KEY (triggered_by_id) REFERENCES daily_brew_users (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_admin_cron_runs DROP FOREIGN KEY FK_ADMIN_CRON_RUNS_TRIGGERED_BY');
        $this->addSql('DROP TABLE daily_brew_admin_cron_runs');
        $this->addSql('DROP TABLE scheduled_command');
    }
}
