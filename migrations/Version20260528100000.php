<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Renames the daily-summary command from `app:send-daily-summary` to
 * `dailybrew:send-daily-summary` in the cron scheduler tables.
 *
 * The Symfony command itself was renamed to the `dailybrew:` prefix on
 * 2026-04-01 (commit 8a6cd8e), matching the convention used by every other
 * command in `src/Command/` (`dailybrew:admin:promote-user`,
 * `dailybrew:seed-reviewer`). `CronJobRegistry` and any existing rows still
 * referenced the dead `app:` name — so the admin scheduler kept trying to run
 * a command Symfony Console doesn't know, exiting with code 1.
 *
 * Updates both the scheduler's source-of-truth (`scheduled_command`) and the
 * audit history (`daily_brew_admin_cron_runs`) so the "last run" badge keeps
 * pointing at the same logical job after the rename.
 */
final class Version20260528100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename app:send-daily-summary to dailybrew:send-daily-summary in cron scheduler tables.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("UPDATE scheduled_command SET command = 'dailybrew:send-daily-summary' WHERE command = 'app:send-daily-summary'");
        $this->addSql("UPDATE daily_brew_admin_cron_runs SET command = 'dailybrew:send-daily-summary' WHERE command = 'app:send-daily-summary'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("UPDATE scheduled_command SET command = 'app:send-daily-summary' WHERE command = 'dailybrew:send-daily-summary'");
        $this->addSql("UPDATE daily_brew_admin_cron_runs SET command = 'app:send-daily-summary' WHERE command = 'dailybrew:send-daily-summary'");
    }
}
