<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260106072556 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_workspace_invites (id INT UNSIGNED AUTO_INCREMENT NOT NULL, workspace_id INT UNSIGNED DEFAULT NULL, employee_id INT UNSIGNED DEFAULT NULL, invited_by_id INT UNSIGNED DEFAULT NULL, invited_user_id INT UNSIGNED DEFAULT NULL, accepted_by_id INT UNSIGNED DEFAULT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', email VARCHAR(180) DEFAULT NULL, email_canonical VARCHAR(180) DEFAULT NULL, role VARCHAR(50) NOT NULL, token VARCHAR(255) NOT NULL, status VARCHAR(20) NOT NULL, expires_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', accepted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_E8D54645B5B48B91 (public_id), INDEX IDX_E8D5464582D40A1F (workspace_id), UNIQUE INDEX UNIQ_E8D546458C03F15C (employee_id), INDEX IDX_E8D54645A7B4A7E3 (invited_by_id), INDEX IDX_E8D54645C58DAD6E (invited_user_id), INDEX IDX_E8D5464520F699D9 (accepted_by_id), UNIQUE INDEX UNIQ_WORKSPACE_INVITE_TOKEN (token), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE daily_brew_workspace_invites ADD CONSTRAINT FK_E8D5464582D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id)');
        $this->addSql('ALTER TABLE daily_brew_workspace_invites ADD CONSTRAINT FK_E8D546458C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_workspace_invites ADD CONSTRAINT FK_E8D54645A7B4A7E3 FOREIGN KEY (invited_by_id) REFERENCES daily_brew_users (id)');
        $this->addSql('ALTER TABLE daily_brew_workspace_invites ADD CONSTRAINT FK_E8D54645C58DAD6E FOREIGN KEY (invited_user_id) REFERENCES daily_brew_users (id)');
        $this->addSql('ALTER TABLE daily_brew_workspace_invites ADD CONSTRAINT FK_E8D5464520F699D9 FOREIGN KEY (accepted_by_id) REFERENCES daily_brew_users (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_workspace_invites DROP FOREIGN KEY FK_E8D5464582D40A1F');
        $this->addSql('ALTER TABLE daily_brew_workspace_invites DROP FOREIGN KEY FK_E8D546458C03F15C');
        $this->addSql('ALTER TABLE daily_brew_workspace_invites DROP FOREIGN KEY FK_E8D54645A7B4A7E3');
        $this->addSql('ALTER TABLE daily_brew_workspace_invites DROP FOREIGN KEY FK_E8D54645C58DAD6E');
        $this->addSql('ALTER TABLE daily_brew_workspace_invites DROP FOREIGN KEY FK_E8D5464520F699D9');
        $this->addSql('DROP TABLE daily_brew_workspace_invites');
    }
}
