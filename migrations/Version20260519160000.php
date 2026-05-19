<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260519160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Feature-flag stages: replace the boolean enabled column with a 4-stage enum (dev/alpha/beta/release), and add Workspace.testing_track so super-admins can opt workspaces into alpha / beta cohorts.';
    }

    public function up(Schema $schema): void
    {
        // Feature flag: enabled → stage. Existing on/off rows map to
        // release/dev so behavior is preserved (on workspaces seeing on
        // → all workspaces see release; off → hidden everywhere).
        $this->addSql("ALTER TABLE daily_brew_feature_flags ADD stage VARCHAR(16) DEFAULT 'dev' NOT NULL");
        $this->addSql("UPDATE daily_brew_feature_flags SET stage = 'release' WHERE enabled = 1");
        $this->addSql("UPDATE daily_brew_feature_flags SET stage = 'dev' WHERE enabled = 0");
        $this->addSql('ALTER TABLE daily_brew_feature_flags DROP enabled');

        // Workspace.testing_track — default 'none' so existing workspaces
        // continue to see release-only surfaces.
        $this->addSql("ALTER TABLE daily_brew_workspaces ADD testing_track VARCHAR(16) DEFAULT 'none' NOT NULL");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspaces DROP testing_track');
        $this->addSql('ALTER TABLE daily_brew_feature_flags ADD enabled TINYINT(1) DEFAULT 0 NOT NULL');
        $this->addSql("UPDATE daily_brew_feature_flags SET enabled = 1 WHERE stage = 'release'");
        $this->addSql('ALTER TABLE daily_brew_feature_flags DROP stage');
    }
}
