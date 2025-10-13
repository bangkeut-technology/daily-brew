<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251013045212 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNQ_ROLE_NAME ON daily_brew_roles');
        $this->addSql('DROP INDEX UNQ_ROLE_NAME_CANONICAL ON daily_brew_roles');
        $this->addSql('ALTER TABLE daily_brew_roles ADD user_id INT UNSIGNED NOT NULL');
        $this->addSql('ALTER TABLE daily_brew_roles ADD CONSTRAINT FK_292E8989A76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id)');
        $this->addSql('CREATE INDEX IDX_292E8989A76ED395 ON daily_brew_roles (user_id)');
        $this->addSql('CREATE UNIQUE INDEX UNQ_ROLE_NAME ON daily_brew_roles (name, user_id)');
        $this->addSql('CREATE UNIQUE INDEX UNQ_ROLE_NAME_CANONICAL ON daily_brew_roles (canonical_name, user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_roles DROP FOREIGN KEY FK_292E8989A76ED395');
        $this->addSql('DROP INDEX IDX_292E8989A76ED395 ON daily_brew_roles');
        $this->addSql('DROP INDEX UNQ_ROLE_NAME ON daily_brew_roles');
        $this->addSql('DROP INDEX UNQ_ROLE_NAME_CANONICAL ON daily_brew_roles');
        $this->addSql('ALTER TABLE daily_brew_roles DROP user_id');
        $this->addSql('CREATE UNIQUE INDEX UNQ_ROLE_NAME ON daily_brew_roles (name)');
        $this->addSql('CREATE UNIQUE INDEX UNQ_ROLE_NAME_CANONICAL ON daily_brew_roles (canonical_name)');
    }
}
