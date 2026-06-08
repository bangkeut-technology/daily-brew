<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds Employee.linked_at — anchors the absent baseline so an employee added
 * mid-month doesn't get counted absent for days before they had a linked User
 * (they literally couldn't check in, since QR check-in needs auth). Stamped on
 * link transitions by the service layer.
 *
 * Backfill: for already-linked employees we use created_at as a safe lower
 * bound — the original link timestamp isn't recoverable, and createdAt is the
 * earliest moment a link could have happened. Without a backfill, every
 * existing linked employee would suddenly disappear from attendance views.
 */
final class Version20260608120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Employee.linked_at to anchor absent calc to actual link date.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_employees ADD linked_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('UPDATE daily_brew_employees SET linked_at = created_at WHERE linked_user_id IS NOT NULL AND linked_at IS NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_employees DROP linked_at');
    }
}
