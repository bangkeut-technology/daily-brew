<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260519140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add daily_brew_mobile_app_config singleton holding iOS/Android identifiers used by the .well-known/apple-app-site-association and assetlinks.json endpoints. Edited by super-admins from /admin/mobile-app-config.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE daily_brew_mobile_app_config (
            id INT AUTO_INCREMENT NOT NULL,
            public_id VARCHAR(36) NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            ios_team_id VARCHAR(32) DEFAULT NULL,
            ios_bundle_id VARCHAR(191) DEFAULT NULL,
            android_package VARCHAR(191) DEFAULT NULL,
            android_sha256_fingerprints JSON DEFAULT NULL,
            UNIQUE INDEX UNIQ_MOBILE_APP_CONFIG_PUBLIC_ID (public_id),
            PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE daily_brew_mobile_app_config');
    }
}
