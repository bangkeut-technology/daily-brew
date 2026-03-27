<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260327103007 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_attendances (id INT AUTO_INCREMENT NOT NULL, public_id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, date DATE NOT NULL, check_in_at DATETIME DEFAULT NULL, check_out_at DATETIME DEFAULT NULL, is_late TINYINT DEFAULT 0 NOT NULL, left_early TINYINT DEFAULT 0 NOT NULL, ip_address VARCHAR(45) DEFAULT NULL, employee_id INT NOT NULL, workspace_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_CD680F1CB5B48B91 (public_id), INDEX IDX_CD680F1C8C03F15C (employee_id), INDEX IDX_CD680F1C82D40A1F (workspace_id), UNIQUE INDEX UNIQ_ATTENDANCE_EMPLOYEE_DATE (employee_id, date), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE daily_brew_closure_periods (id INT AUTO_INCREMENT NOT NULL, public_id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, name VARCHAR(255) NOT NULL, name_canonical VARCHAR(255) NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL, workspace_id INT NOT NULL, UNIQUE INDEX UNIQ_20224897B5B48B91 (public_id), INDEX IDX_2022489782D40A1F (workspace_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE daily_brew_employees (id INT AUTO_INCREMENT NOT NULL, public_id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, phone_number VARCHAR(20) DEFAULT NULL, dob DATETIME DEFAULT NULL, joined_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, status VARCHAR(255) NOT NULL, qr_token VARCHAR(64) DEFAULT NULL, user_id INT NOT NULL, linked_user_id INT DEFAULT NULL, workspace_id INT DEFAULT NULL, shift_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_370C3B6FB5B48B91 (public_id), UNIQUE INDEX UNIQ_370C3B6F1AE26361 (qr_token), INDEX IDX_370C3B6FA76ED395 (user_id), UNIQUE INDEX UNIQ_370C3B6FCC26EB02 (linked_user_id), INDEX IDX_370C3B6F82D40A1F (workspace_id), INDEX IDX_370C3B6FBB70BC0E (shift_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE daily_brew_leave_requests (id INT AUTO_INCREMENT NOT NULL, public_id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, type VARCHAR(255) NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL, reason LONGTEXT DEFAULT NULL, status VARCHAR(255) NOT NULL, reviewed_at DATETIME DEFAULT NULL, review_note LONGTEXT DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, employee_id INT NOT NULL, workspace_id INT NOT NULL, requested_by_id INT NOT NULL, reviewed_by_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_789BF0AAB5B48B91 (public_id), INDEX IDX_789BF0AA8C03F15C (employee_id), INDEX IDX_789BF0AA82D40A1F (workspace_id), INDEX IDX_789BF0AA4DA1E751 (requested_by_id), INDEX IDX_789BF0AAFC6B21F1 (reviewed_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE daily_brew_refresh_tokens (refresh_token VARCHAR(128) NOT NULL, username VARCHAR(255) NOT NULL, valid DATETIME NOT NULL, id INT AUTO_INCREMENT NOT NULL, UNIQUE INDEX UNIQ_A69AE9B9C74F2195 (refresh_token), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE daily_brew_shift_time_rules (id INT AUTO_INCREMENT NOT NULL, public_id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, day_of_week INT NOT NULL, start_time VARCHAR(5) NOT NULL, end_time VARCHAR(5) NOT NULL, shift_id INT NOT NULL, UNIQUE INDEX UNIQ_6D8DF402B5B48B91 (public_id), INDEX IDX_6D8DF402BB70BC0E (shift_id), UNIQUE INDEX UNIQ_SHIFT_DAY (shift_id, day_of_week), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE daily_brew_shifts (id INT AUTO_INCREMENT NOT NULL, public_id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, name VARCHAR(100) NOT NULL, start_time TIME DEFAULT NULL, end_time TIME DEFAULT NULL, grace_late_minutes SMALLINT UNSIGNED DEFAULT 0 NOT NULL, grace_early_minutes SMALLINT UNSIGNED DEFAULT 0 NOT NULL, workspace_id INT NOT NULL, UNIQUE INDEX UNIQ_8CE60D1FB5B48B91 (public_id), INDEX IDX_8CE60D1F82D40A1F (workspace_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE daily_brew_subscriptions (id INT AUTO_INCREMENT NOT NULL, public_id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, plan VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL, paddle_subscription_id VARCHAR(255) DEFAULT NULL, paddle_customer_id VARCHAR(255) DEFAULT NULL, current_period_end DATETIME DEFAULT NULL, canceled_at DATETIME DEFAULT NULL, workspace_id INT NOT NULL, UNIQUE INDEX UNIQ_EAEC0564B5B48B91 (public_id), UNIQUE INDEX UNIQ_EAEC056482D40A1F (workspace_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE daily_brew_users (id INT AUTO_INCREMENT NOT NULL, public_id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, secret VARCHAR(225) NOT NULL, email VARCHAR(180) NOT NULL, email_canonical VARCHAR(180) NOT NULL, roles JSON NOT NULL, first_name VARCHAR(150) DEFAULT NULL, last_name VARCHAR(150) DEFAULT NULL, dob DATE DEFAULT NULL, image_name VARCHAR(255) DEFAULT NULL, file_size INT DEFAULT NULL, original_name VARCHAR(255) DEFAULT NULL, mime_type VARCHAR(255) DEFAULT NULL, dimensions JSON DEFAULT NULL, password VARCHAR(255) DEFAULT NULL, enabled TINYINT NOT NULL, locale VARCHAR(5) DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, apple_id VARCHAR(255) DEFAULT NULL, google_id VARCHAR(255) DEFAULT NULL, onboarding_completed TINYINT DEFAULT 0 NOT NULL, password_reset_token VARCHAR(128) DEFAULT NULL, password_reset_expires_at DATETIME DEFAULT NULL, current_workspace_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_8B9302A7B5B48B91 (public_id), INDEX IDX_8B9302A77D65B4C4 (current_workspace_id), UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL_CANONICAL (email_canonical), UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL_SECRET (secret), UNIQUE INDEX UNIQ_IDENTIFIER_APPLE_ID (apple_id), UNIQUE INDEX UNIQ_IDENTIFIER_GOOGLE_ID (google_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE daily_brew_workspace_settings (id INT AUTO_INCREMENT NOT NULL, public_id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, ip_restriction_enabled TINYINT DEFAULT 0 NOT NULL, allowed_ips JSON DEFAULT NULL, timezone VARCHAR(50) DEFAULT \'Asia/Phnom_Penh\' NOT NULL, locale VARCHAR(5) DEFAULT \'en\' NOT NULL, geofencing_enabled TINYINT DEFAULT 0 NOT NULL, geofencing_latitude DOUBLE PRECISION DEFAULT NULL, geofencing_longitude DOUBLE PRECISION DEFAULT NULL, geofencing_radius_meters INT DEFAULT 100, workspace_id INT NOT NULL, UNIQUE INDEX UNIQ_A71C9385B5B48B91 (public_id), UNIQUE INDEX UNIQ_A71C938582D40A1F (workspace_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE daily_brew_workspaces (id INT AUTO_INCREMENT NOT NULL, public_id BINARY(16) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, name VARCHAR(255) DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, image_name VARCHAR(255) DEFAULT NULL, file_size INT DEFAULT NULL, original_name VARCHAR(255) DEFAULT NULL, mime_type VARCHAR(255) DEFAULT NULL, dimensions JSON DEFAULT NULL, owner_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_A26801FAB5B48B91 (public_id), INDEX IDX_A26801FA7E3C61F9 (owner_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD CONSTRAINT FK_CD680F1C8C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD CONSTRAINT FK_CD680F1C82D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_closure_periods ADD CONSTRAINT FK_2022489782D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id)');
        $this->addSql('ALTER TABLE daily_brew_employees ADD CONSTRAINT FK_370C3B6FA76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id)');
        $this->addSql('ALTER TABLE daily_brew_employees ADD CONSTRAINT FK_370C3B6FCC26EB02 FOREIGN KEY (linked_user_id) REFERENCES daily_brew_users (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_employees ADD CONSTRAINT FK_370C3B6F82D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_employees ADD CONSTRAINT FK_370C3B6FBB70BC0E FOREIGN KEY (shift_id) REFERENCES daily_brew_shifts (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_leave_requests ADD CONSTRAINT FK_789BF0AA8C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_leave_requests ADD CONSTRAINT FK_789BF0AA82D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_leave_requests ADD CONSTRAINT FK_789BF0AA4DA1E751 FOREIGN KEY (requested_by_id) REFERENCES daily_brew_users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_leave_requests ADD CONSTRAINT FK_789BF0AAFC6B21F1 FOREIGN KEY (reviewed_by_id) REFERENCES daily_brew_users (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_shift_time_rules ADD CONSTRAINT FK_6D8DF402BB70BC0E FOREIGN KEY (shift_id) REFERENCES daily_brew_shifts (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_shifts ADD CONSTRAINT FK_8CE60D1F82D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_subscriptions ADD CONSTRAINT FK_EAEC056482D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id)');
        $this->addSql('ALTER TABLE daily_brew_users ADD CONSTRAINT FK_8B9302A77D65B4C4 FOREIGN KEY (current_workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_workspace_settings ADD CONSTRAINT FK_A71C938582D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_workspaces ADD CONSTRAINT FK_A26801FA7E3C61F9 FOREIGN KEY (owner_id) REFERENCES daily_brew_users (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_attendances DROP FOREIGN KEY FK_CD680F1C8C03F15C');
        $this->addSql('ALTER TABLE daily_brew_attendances DROP FOREIGN KEY FK_CD680F1C82D40A1F');
        $this->addSql('ALTER TABLE daily_brew_closure_periods DROP FOREIGN KEY FK_2022489782D40A1F');
        $this->addSql('ALTER TABLE daily_brew_employees DROP FOREIGN KEY FK_370C3B6FA76ED395');
        $this->addSql('ALTER TABLE daily_brew_employees DROP FOREIGN KEY FK_370C3B6FCC26EB02');
        $this->addSql('ALTER TABLE daily_brew_employees DROP FOREIGN KEY FK_370C3B6F82D40A1F');
        $this->addSql('ALTER TABLE daily_brew_employees DROP FOREIGN KEY FK_370C3B6FBB70BC0E');
        $this->addSql('ALTER TABLE daily_brew_leave_requests DROP FOREIGN KEY FK_789BF0AA8C03F15C');
        $this->addSql('ALTER TABLE daily_brew_leave_requests DROP FOREIGN KEY FK_789BF0AA82D40A1F');
        $this->addSql('ALTER TABLE daily_brew_leave_requests DROP FOREIGN KEY FK_789BF0AA4DA1E751');
        $this->addSql('ALTER TABLE daily_brew_leave_requests DROP FOREIGN KEY FK_789BF0AAFC6B21F1');
        $this->addSql('ALTER TABLE daily_brew_shift_time_rules DROP FOREIGN KEY FK_6D8DF402BB70BC0E');
        $this->addSql('ALTER TABLE daily_brew_shifts DROP FOREIGN KEY FK_8CE60D1F82D40A1F');
        $this->addSql('ALTER TABLE daily_brew_subscriptions DROP FOREIGN KEY FK_EAEC056482D40A1F');
        $this->addSql('ALTER TABLE daily_brew_users DROP FOREIGN KEY FK_8B9302A77D65B4C4');
        $this->addSql('ALTER TABLE daily_brew_workspace_settings DROP FOREIGN KEY FK_A71C938582D40A1F');
        $this->addSql('ALTER TABLE daily_brew_workspaces DROP FOREIGN KEY FK_A26801FA7E3C61F9');
        $this->addSql('DROP TABLE daily_brew_attendances');
        $this->addSql('DROP TABLE daily_brew_closure_periods');
        $this->addSql('DROP TABLE daily_brew_employees');
        $this->addSql('DROP TABLE daily_brew_leave_requests');
        $this->addSql('DROP TABLE daily_brew_refresh_tokens');
        $this->addSql('DROP TABLE daily_brew_shift_time_rules');
        $this->addSql('DROP TABLE daily_brew_shifts');
        $this->addSql('DROP TABLE daily_brew_subscriptions');
        $this->addSql('DROP TABLE daily_brew_users');
        $this->addSql('DROP TABLE daily_brew_workspace_settings');
        $this->addSql('DROP TABLE daily_brew_workspaces');
    }
}
