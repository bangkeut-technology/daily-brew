<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260302010508 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_attendance_batches DROP FOREIGN KEY FK_22FA5C72B092A811');
        $this->addSql('ALTER TABLE daily_brew_attendances DROP FOREIGN KEY FK_CD680F1CB092A811');
        $this->addSql('ALTER TABLE daily_brew_employees DROP FOREIGN KEY FK_370C3B6FB092A811');
        $this->addSql('CREATE TABLE daily_brew_employee_salaries (id INT UNSIGNED AUTO_INCREMENT NOT NULL, employee_id INT UNSIGNED NOT NULL, workspace_id INT UNSIGNED DEFAULT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', base_salary NUMERIC(10, 2) NOT NULL, currency VARCHAR(3) NOT NULL, salary_type VARCHAR(255) NOT NULL, effective_from DATE NOT NULL COMMENT \'(DC2Type:date_immutable)\', effective_to DATE DEFAULT NULL COMMENT \'(DC2Type:date_immutable)\', UNIQUE INDEX UNIQ_45472EAEB5B48B91 (public_id), UNIQUE INDEX UNIQ_45472EAE8C03F15C (employee_id), INDEX IDX_45472EAE82D40A1F (workspace_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_payroll_runs (id INT UNSIGNED AUTO_INCREMENT NOT NULL, workspace_id INT UNSIGNED NOT NULL, processed_by_id INT UNSIGNED DEFAULT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', period DATE NOT NULL COMMENT \'(DC2Type:date_immutable)\', status VARCHAR(255) NOT NULL, processed_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_AEF4A5DEB5B48B91 (public_id), INDEX IDX_AEF4A5DE82D40A1F (workspace_id), INDEX IDX_AEF4A5DE2FFD4FD3 (processed_by_id), UNIQUE INDEX UNIQ_PAYROLL_RUN_WORKSPACE_PERIOD (workspace_id, period), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_payslip_items (id INT UNSIGNED AUTO_INCREMENT NOT NULL, payslip_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', type VARCHAR(255) NOT NULL, label VARCHAR(255) NOT NULL, amount NUMERIC(10, 2) NOT NULL, UNIQUE INDEX UNIQ_33827A90B5B48B91 (public_id), INDEX IDX_33827A90296F5EA7 (payslip_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_payslips (id INT UNSIGNED AUTO_INCREMENT NOT NULL, payroll_run_id INT UNSIGNED NOT NULL, employee_id INT UNSIGNED NOT NULL, workspace_id INT UNSIGNED DEFAULT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', base_salary NUMERIC(10, 2) NOT NULL, total_allowances NUMERIC(10, 2) NOT NULL, total_deductions NUMERIC(10, 2) NOT NULL, net_pay NUMERIC(10, 2) NOT NULL, currency VARCHAR(3) NOT NULL, working_days INT NOT NULL, present_days INT NOT NULL, absent_days INT NOT NULL, late_days INT NOT NULL, paid_leave_days INT NOT NULL, unpaid_leave_days INT NOT NULL, status VARCHAR(255) NOT NULL, paid_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', notes LONGTEXT DEFAULT NULL, deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_20DCB4C5B5B48B91 (public_id), INDEX IDX_20DCB4C5A5FC78E (payroll_run_id), INDEX IDX_20DCB4C58C03F15C (employee_id), INDEX IDX_20DCB4C582D40A1F (workspace_id), UNIQUE INDEX UNIQ_PAYSLIP_RUN_EMPLOYEE (payroll_run_id, employee_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_workspace_allowed_ips (id INT UNSIGNED AUTO_INCREMENT NOT NULL, workspace_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', ip VARCHAR(45) NOT NULL, label VARCHAR(100) DEFAULT NULL, is_active TINYINT(1) NOT NULL, deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_3BC3CA45B5B48B91 (public_id), INDEX IDX_3BC3CA4582D40A1F (workspace_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_workspace_user_ratings (id INT UNSIGNED AUTO_INCREMENT NOT NULL, reviewer_id INT UNSIGNED NOT NULL, reviewee_id INT UNSIGNED NOT NULL, workspace_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', score SMALLINT NOT NULL, comment LONGTEXT DEFAULT NULL, period DATE DEFAULT NULL COMMENT \'(DC2Type:date_immutable)\', deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_D829DC96B5B48B91 (public_id), INDEX IDX_D829DC9670574616 (reviewer_id), INDEX IDX_D829DC96BD992930 (reviewee_id), INDEX IDX_D829DC9682D40A1F (workspace_id), UNIQUE INDEX UNIQ_RATING_PAIR_PERIOD (reviewer_id, reviewee_id, workspace_id, period), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE daily_brew_employee_salaries ADD CONSTRAINT FK_45472EAE8C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_employee_salaries ADD CONSTRAINT FK_45472EAE82D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_payroll_runs ADD CONSTRAINT FK_AEF4A5DE82D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_payroll_runs ADD CONSTRAINT FK_AEF4A5DE2FFD4FD3 FOREIGN KEY (processed_by_id) REFERENCES daily_brew_users (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_payslip_items ADD CONSTRAINT FK_33827A90296F5EA7 FOREIGN KEY (payslip_id) REFERENCES daily_brew_payslips (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_payslips ADD CONSTRAINT FK_20DCB4C5A5FC78E FOREIGN KEY (payroll_run_id) REFERENCES daily_brew_payroll_runs (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_payslips ADD CONSTRAINT FK_20DCB4C58C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_payslips ADD CONSTRAINT FK_20DCB4C582D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_workspace_allowed_ips ADD CONSTRAINT FK_3BC3CA4582D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings ADD CONSTRAINT FK_D829DC9670574616 FOREIGN KEY (reviewer_id) REFERENCES daily_brew_users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings ADD CONSTRAINT FK_D829DC96BD992930 FOREIGN KEY (reviewee_id) REFERENCES daily_brew_users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings ADD CONSTRAINT FK_D829DC9682D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_stores DROP FOREIGN KEY FK_446B00FC82D40A1F');
        $this->addSql('ALTER TABLE daily_brew_stores DROP FOREIGN KEY FK_446B00FCA76ED395');
        $this->addSql('DROP TABLE daily_brew_stores');
        $this->addSql('DROP INDEX IDX_22FA5C72B092A811 ON daily_brew_attendance_batches');
        $this->addSql('ALTER TABLE daily_brew_attendance_batches DROP store_id');
        $this->addSql('DROP INDEX IDX_CD680F1CB092A811 ON daily_brew_attendances');
        $this->addSql('ALTER TABLE daily_brew_attendances DROP store_id');
        $this->addSql('DROP INDEX IDX_370C3B6FB092A811 ON daily_brew_employees');
        $this->addSql('ALTER TABLE daily_brew_employees DROP store_id');
        $this->addSql('ALTER TABLE daily_brew_users ADD google_id VARCHAR(255) DEFAULT NULL, CHANGE auth_code apple_id VARCHAR(255) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_APPLE_ID ON daily_brew_users (apple_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_GOOGLE_ID ON daily_brew_users (google_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_stores (id INT UNSIGNED AUTO_INCREMENT NOT NULL, user_id INT UNSIGNED DEFAULT NULL, workspace_id INT UNSIGNED DEFAULT NULL, public_id VARCHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', name VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, canonical_name VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_446B00FCB5B48B91 (public_id), UNIQUE INDEX UNIQ_STORE_NAME (name, user_id), UNIQUE INDEX UNIQ_STORE_CANONICAL_NAME (canonical_name, user_id), INDEX IDX_446B00FCA76ED395 (user_id), INDEX IDX_446B00FC82D40A1F (workspace_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE daily_brew_stores ADD CONSTRAINT FK_446B00FC82D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_stores ADD CONSTRAINT FK_446B00FCA76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE daily_brew_employee_salaries DROP FOREIGN KEY FK_45472EAE8C03F15C');
        $this->addSql('ALTER TABLE daily_brew_employee_salaries DROP FOREIGN KEY FK_45472EAE82D40A1F');
        $this->addSql('ALTER TABLE daily_brew_payroll_runs DROP FOREIGN KEY FK_AEF4A5DE82D40A1F');
        $this->addSql('ALTER TABLE daily_brew_payroll_runs DROP FOREIGN KEY FK_AEF4A5DE2FFD4FD3');
        $this->addSql('ALTER TABLE daily_brew_payslip_items DROP FOREIGN KEY FK_33827A90296F5EA7');
        $this->addSql('ALTER TABLE daily_brew_payslips DROP FOREIGN KEY FK_20DCB4C5A5FC78E');
        $this->addSql('ALTER TABLE daily_brew_payslips DROP FOREIGN KEY FK_20DCB4C58C03F15C');
        $this->addSql('ALTER TABLE daily_brew_payslips DROP FOREIGN KEY FK_20DCB4C582D40A1F');
        $this->addSql('ALTER TABLE daily_brew_workspace_allowed_ips DROP FOREIGN KEY FK_3BC3CA4582D40A1F');
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings DROP FOREIGN KEY FK_D829DC9670574616');
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings DROP FOREIGN KEY FK_D829DC96BD992930');
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings DROP FOREIGN KEY FK_D829DC9682D40A1F');
        $this->addSql('DROP TABLE daily_brew_employee_salaries');
        $this->addSql('DROP TABLE daily_brew_payroll_runs');
        $this->addSql('DROP TABLE daily_brew_payslip_items');
        $this->addSql('DROP TABLE daily_brew_payslips');
        $this->addSql('DROP TABLE daily_brew_workspace_allowed_ips');
        $this->addSql('DROP TABLE daily_brew_workspace_user_ratings');
        $this->addSql('ALTER TABLE daily_brew_attendance_batches ADD store_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_attendance_batches ADD CONSTRAINT FK_22FA5C72B092A811 FOREIGN KEY (store_id) REFERENCES daily_brew_stores (id) ON UPDATE NO ACTION ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_22FA5C72B092A811 ON daily_brew_attendance_batches (store_id)');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD store_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD CONSTRAINT FK_CD680F1CB092A811 FOREIGN KEY (store_id) REFERENCES daily_brew_stores (id) ON UPDATE NO ACTION ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_CD680F1CB092A811 ON daily_brew_attendances (store_id)');
        $this->addSql('ALTER TABLE daily_brew_employees ADD store_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_employees ADD CONSTRAINT FK_370C3B6FB092A811 FOREIGN KEY (store_id) REFERENCES daily_brew_stores (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_370C3B6FB092A811 ON daily_brew_employees (store_id)');
        $this->addSql('DROP INDEX UNIQ_IDENTIFIER_APPLE_ID ON daily_brew_users');
        $this->addSql('DROP INDEX UNIQ_IDENTIFIER_GOOGLE_ID ON daily_brew_users');
        $this->addSql('ALTER TABLE daily_brew_users ADD auth_code VARCHAR(255) DEFAULT NULL, DROP apple_id, DROP google_id');
    }
}
