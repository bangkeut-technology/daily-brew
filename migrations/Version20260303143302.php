<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260303143302 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Shift and ShiftTimeRule entities; add shift_id FK to employees';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_shift_time_rules (id INT UNSIGNED AUTO_INCREMENT NOT NULL, shift_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', day_of_week INT NOT NULL, start_time VARCHAR(5) NOT NULL, end_time VARCHAR(5) NOT NULL, UNIQUE INDEX UNIQ_6D8DF402B5B48B91 (public_id), INDEX IDX_6D8DF402BB70BC0E (shift_id), UNIQUE INDEX UNIQ_SHIFT_DAY (shift_id, day_of_week), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_shifts (id INT UNSIGNED AUTO_INCREMENT NOT NULL, workspace_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', name VARCHAR(100) NOT NULL, grace_late_minutes SMALLINT UNSIGNED DEFAULT 0 NOT NULL, grace_early_minutes SMALLINT UNSIGNED DEFAULT 0 NOT NULL, UNIQUE INDEX UNIQ_8CE60D1FB5B48B91 (public_id), INDEX IDX_8CE60D1F82D40A1F (workspace_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE daily_brew_shift_time_rules ADD CONSTRAINT FK_6D8DF402BB70BC0E FOREIGN KEY (shift_id) REFERENCES daily_brew_shifts (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_shifts ADD CONSTRAINT FK_8CE60D1F82D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_employees ADD shift_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_employees ADD CONSTRAINT FK_370C3B6FBB70BC0E FOREIGN KEY (shift_id) REFERENCES daily_brew_shifts (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_370C3B6FBB70BC0E ON daily_brew_employees (shift_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_employees DROP FOREIGN KEY FK_370C3B6FBB70BC0E');
        $this->addSql('ALTER TABLE daily_brew_shift_time_rules DROP FOREIGN KEY FK_6D8DF402BB70BC0E');
        $this->addSql('ALTER TABLE daily_brew_shifts DROP FOREIGN KEY FK_8CE60D1F82D40A1F');
        $this->addSql('DROP TABLE daily_brew_shift_time_rules');
        $this->addSql('DROP TABLE daily_brew_shifts');
        $this->addSql('DROP INDEX IDX_370C3B6FBB70BC0E ON daily_brew_employees');
        $this->addSql('ALTER TABLE daily_brew_employees DROP shift_id');
    }
}
