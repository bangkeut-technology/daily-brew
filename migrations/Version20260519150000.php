<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260519150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add daily_brew_feature_flags — platform-level on/off switches managed by super-admins at /admin/feature-flags. Lets us ship dark modules (e.g. NFC check-in) and turn them on only when ready to announce.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE daily_brew_feature_flags (
            id INT AUTO_INCREMENT NOT NULL,
            public_id VARCHAR(36) NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            flag_key VARCHAR(64) NOT NULL,
            enabled TINYINT(1) DEFAULT 0 NOT NULL,
            UNIQUE INDEX UNIQ_FEATURE_FLAGS_PUBLIC_ID (public_id),
            UNIQUE INDEX UNIQ_FEATURE_FLAGS_KEY (flag_key),
            PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE daily_brew_feature_flags');
    }
}
