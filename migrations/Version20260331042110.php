<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260331042110 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_device_tokens (id INT AUTO_INCREMENT NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, token VARCHAR(255) NOT NULL, platform VARCHAR(20) NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_97D1EFF0B5B48B91 (public_id), INDEX IDX_97D1EFF0A76ED395 (user_id), UNIQUE INDEX UNIQ_DEVICE_TOKEN (token), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE daily_brew_device_tokens ADD CONSTRAINT FK_97D1EFF0A76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_device_tokens DROP FOREIGN KEY FK_97D1EFF0A76ED395');
        $this->addSql('DROP TABLE daily_brew_device_tokens');
    }
}
