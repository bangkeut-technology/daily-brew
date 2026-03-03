<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260302155842 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add employee_id FK to workspace_users table';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_workspace_users ADD employee_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_workspace_users ADD CONSTRAINT FK_4200BCE8C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_4200BCE8C03F15C ON daily_brew_workspace_users (employee_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_workspace_users DROP FOREIGN KEY FK_4200BCE8C03F15C');
        $this->addSql('DROP INDEX IDX_4200BCE8C03F15C ON daily_brew_workspace_users');
        $this->addSql('ALTER TABLE daily_brew_workspace_users DROP employee_id');
    }
}
