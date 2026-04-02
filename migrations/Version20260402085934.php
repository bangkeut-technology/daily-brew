<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260402085934 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_api_tokens (id INT AUTO_INCREMENT NOT NULL, public_id VARCHAR(36) NOT NULL, prefix VARCHAR(8) NOT NULL, token_hash VARCHAR(64) NOT NULL, name VARCHAR(100) NOT NULL, last_used_at DATETIME DEFAULT NULL, revoked_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, workspace_id INT NOT NULL, UNIQUE INDEX UNIQ_F12DA43FB5B48B91 (public_id), UNIQUE INDEX UNIQ_F12DA43FB3BC57DA (token_hash), INDEX IDX_F12DA43F82D40A1F (workspace_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE daily_brew_api_tokens ADD CONSTRAINT FK_F12DA43F82D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_api_tokens DROP FOREIGN KEY FK_F12DA43F82D40A1F');
        $this->addSql('DROP TABLE daily_brew_api_tokens');
    }
}
