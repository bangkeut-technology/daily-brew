<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251007061003 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_demo_sessions (id INT UNSIGNED AUTO_INCREMENT NOT NULL, user_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', device_id VARCHAR(255) NOT NULL, expires_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', active TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_8201C815B5B48B91 (public_id), INDEX IDX_8201C815A76ED395 (user_id), UNIQUE INDEX UNIQ_DEMO_SESSION_DEVICE_ID (device_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE daily_brew_demo_sessions ADD CONSTRAINT FK_8201C815A76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_demo_sessions DROP FOREIGN KEY FK_8201C815A76ED395');
        $this->addSql('DROP TABLE daily_brew_demo_sessions');
    }
}
