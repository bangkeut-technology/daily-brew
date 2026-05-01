<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260501060210 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add WorkspaceQrCode entity and Attendance.qr_code_id for sub-QR check-in (Double Espresso).';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE daily_brew_workspace_qr_codes (id INT AUTO_INCREMENT NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, qr_token VARCHAR(24) NOT NULL, name VARCHAR(100) NOT NULL, inherit_ip_settings TINYINT DEFAULT 1 NOT NULL, ip_restriction_enabled TINYINT DEFAULT 0 NOT NULL, allowed_ips JSON DEFAULT NULL, inherit_geofencing TINYINT DEFAULT 1 NOT NULL, geofencing_enabled TINYINT DEFAULT 0 NOT NULL, geofencing_latitude DOUBLE PRECISION DEFAULT NULL, geofencing_longitude DOUBLE PRECISION DEFAULT NULL, geofencing_radius_meters INT DEFAULT 100, inherit_device_verification TINYINT DEFAULT 1 NOT NULL, device_verification_enabled TINYINT DEFAULT 0 NOT NULL, workspace_id INT NOT NULL, manager_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_E2213057B5B48B91 (public_id), UNIQUE INDEX UNIQ_E22130571AE26361 (qr_token), INDEX IDX_E221305782D40A1F (workspace_id), INDEX IDX_E2213057783E3463 (manager_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE daily_brew_workspace_qr_code_employees (workspace_qr_code_id INT NOT NULL, employee_id INT NOT NULL, INDEX IDX_4E5BD73DFB53248F (workspace_qr_code_id), INDEX IDX_4E5BD73D8C03F15C (employee_id), PRIMARY KEY (workspace_qr_code_id, employee_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE daily_brew_workspace_qr_codes ADD CONSTRAINT FK_E221305782D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_workspace_qr_codes ADD CONSTRAINT FK_E2213057783E3463 FOREIGN KEY (manager_id) REFERENCES daily_brew_employees (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_workspace_qr_code_employees ADD CONSTRAINT FK_4E5BD73DFB53248F FOREIGN KEY (workspace_qr_code_id) REFERENCES daily_brew_workspace_qr_codes (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_workspace_qr_code_employees ADD CONSTRAINT FK_4E5BD73D8C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD qr_code_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD CONSTRAINT FK_CD680F1C12E4AD80 FOREIGN KEY (qr_code_id) REFERENCES daily_brew_workspace_qr_codes (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_CD680F1C12E4AD80 ON daily_brew_attendances (qr_code_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_qr_codes DROP FOREIGN KEY FK_E221305782D40A1F');
        $this->addSql('ALTER TABLE daily_brew_workspace_qr_codes DROP FOREIGN KEY FK_E2213057783E3463');
        $this->addSql('ALTER TABLE daily_brew_workspace_qr_code_employees DROP FOREIGN KEY FK_4E5BD73DFB53248F');
        $this->addSql('ALTER TABLE daily_brew_workspace_qr_code_employees DROP FOREIGN KEY FK_4E5BD73D8C03F15C');
        $this->addSql('DROP TABLE daily_brew_workspace_qr_codes');
        $this->addSql('DROP TABLE daily_brew_workspace_qr_code_employees');
        $this->addSql('ALTER TABLE daily_brew_attendances DROP FOREIGN KEY FK_CD680F1C12E4AD80');
        $this->addSql('DROP INDEX IDX_CD680F1C12E4AD80 ON daily_brew_attendances');
        $this->addSql('ALTER TABLE daily_brew_attendances DROP qr_code_id');
    }
}
