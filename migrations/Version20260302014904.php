<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260302014904 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_leave_requests (id INT UNSIGNED AUTO_INCREMENT NOT NULL, employee_id INT UNSIGNED NOT NULL, workspace_id INT UNSIGNED NOT NULL, requested_by_id INT UNSIGNED NOT NULL, reviewed_by_id INT UNSIGNED DEFAULT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', type VARCHAR(255) NOT NULL, start_date DATE NOT NULL COMMENT \'(DC2Type:date_immutable)\', end_date DATE NOT NULL COMMENT \'(DC2Type:date_immutable)\', reason LONGTEXT DEFAULT NULL, status VARCHAR(255) NOT NULL, reviewed_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', review_note LONGTEXT DEFAULT NULL, deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_789BF0AAB5B48B91 (public_id), INDEX IDX_789BF0AA8C03F15C (employee_id), INDEX IDX_789BF0AA82D40A1F (workspace_id), INDEX IDX_789BF0AA4DA1E751 (requested_by_id), INDEX IDX_789BF0AAFC6B21F1 (reviewed_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_workspace_settings (id INT UNSIGNED AUTO_INCREMENT NOT NULL, workspace_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', name VARCHAR(255) NOT NULL, value VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_A71C9385B5B48B91 (public_id), INDEX IDX_A71C938582D40A1F (workspace_id), UNIQUE INDEX UNIQ_WORKSPACE_SETTING_NAME (name, workspace_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE daily_brew_leave_requests ADD CONSTRAINT FK_789BF0AA8C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_leave_requests ADD CONSTRAINT FK_789BF0AA82D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_leave_requests ADD CONSTRAINT FK_789BF0AA4DA1E751 FOREIGN KEY (requested_by_id) REFERENCES daily_brew_users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_leave_requests ADD CONSTRAINT FK_789BF0AAFC6B21F1 FOREIGN KEY (reviewed_by_id) REFERENCES daily_brew_users (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_workspace_settings ADD CONSTRAINT FK_A71C938582D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_leave_requests DROP FOREIGN KEY FK_789BF0AA8C03F15C');
        $this->addSql('ALTER TABLE daily_brew_leave_requests DROP FOREIGN KEY FK_789BF0AA82D40A1F');
        $this->addSql('ALTER TABLE daily_brew_leave_requests DROP FOREIGN KEY FK_789BF0AA4DA1E751');
        $this->addSql('ALTER TABLE daily_brew_leave_requests DROP FOREIGN KEY FK_789BF0AAFC6B21F1');
        $this->addSql('ALTER TABLE daily_brew_workspace_settings DROP FOREIGN KEY FK_A71C938582D40A1F');
        $this->addSql('DROP TABLE daily_brew_leave_requests');
        $this->addSql('DROP TABLE daily_brew_workspace_settings');
    }
}
