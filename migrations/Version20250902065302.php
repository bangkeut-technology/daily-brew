<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250902065302 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_settings (id INT UNSIGNED AUTO_INCREMENT NOT NULL, owner_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', name VARCHAR(255) NOT NULL, value VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_66B74AE3B5B48B91 (public_id), INDEX IDX_66B74AE37E3C61F9 (owner_id), UNIQUE INDEX UNIQ_SETTING_NAME (name), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE daily_brew_settings ADD CONSTRAINT FK_66B74AE37E3C61F9 FOREIGN KEY (owner_id) REFERENCES daily_brew_users (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_settings DROP FOREIGN KEY FK_66B74AE37E3C61F9');
        $this->addSql('DROP TABLE daily_brew_settings');
    }
}
