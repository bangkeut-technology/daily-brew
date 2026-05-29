<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds a per-workspace NFC cooldown so a panicked employee who taps an NFC
 * tag twice in a row doesn't accidentally check themselves back out.
 *
 * `nfc_checkin_interval_minutes` is the minimum time (in minutes) between
 * successive NFC scans by the same employee. A scan inside the window is
 * silently ignored — no new Attendance row, no error toast — so the mobile
 * UI just keeps showing "checked in" and the user feels nothing strange.
 *
 * Defaults to 15 because that's wide enough to defeat a double-tap but
 * short enough that a 30-minute coffee-shop shift can still check out.
 * Range 0–120 enforced in the entity setter (0 disables the cooldown).
 */
final class Version20260529100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add WorkspaceSetting.nfc_checkin_interval_minutes (default 15) — cooldown to suppress accidental NFC double-taps.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings ADD nfc_checkin_interval_minutes INT DEFAULT 15 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings DROP nfc_checkin_interval_minutes');
    }
}
