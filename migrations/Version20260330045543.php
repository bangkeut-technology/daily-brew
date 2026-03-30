<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260330045543 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_employees ADD username VARCHAR(50) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_370C3B6FF85E0677 ON daily_brew_employees (username)');
        $this->addSql('ALTER TABLE daily_brew_workspace_settings ADD date_format VARCHAR(12) DEFAULT \'DD/MM/YYYY\' NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_370C3B6FF85E0677 ON daily_brew_employees');
        $this->addSql('ALTER TABLE daily_brew_employees DROP username');
        $this->addSql('ALTER TABLE daily_brew_workspace_settings DROP date_format');
    }
}
