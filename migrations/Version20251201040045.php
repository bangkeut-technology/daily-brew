<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251201040045 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE account (id INT UNSIGNED AUTO_INCREMENT NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', name VARCHAR(255) DEFAULT NULL, plan VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_7D3656A4B5B48B91 (public_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE account_user (id INT AUTO_INCREMENT NOT NULL, account_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NOT NULL, role VARCHAR(255) NOT NULL, INDEX IDX_10051E39B6B5FBA (account_id), INDEX IDX_10051E3A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_user_settings (id INT UNSIGNED AUTO_INCREMENT NOT NULL, user_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', name VARCHAR(255) NOT NULL, value VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_EB53CBA0B5B48B91 (public_id), INDEX IDX_EB53CBA0A76ED395 (user_id), UNIQUE INDEX UNIQ_SETTING_NAME (name, user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE account_user ADD CONSTRAINT FK_10051E39B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id)');
        $this->addSql('ALTER TABLE account_user ADD CONSTRAINT FK_10051E3A76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id)');
        $this->addSql('ALTER TABLE daily_brew_user_settings ADD CONSTRAINT FK_EB53CBA0A76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_settings DROP FOREIGN KEY FK_63B03ADA7E3C61F9');
        $this->addSql('DROP TABLE daily_brew_settings');
        $this->addSql('DROP INDEX UNIQ_ATTENDANCE_BATCH_CANONICAL_LABEL ON daily_brew_attendance_batches');
        $this->addSql('DROP INDEX UNIQ_ATTENDANCE_BATCH_LABEL ON daily_brew_attendance_batches');
        $this->addSql('ALTER TABLE daily_brew_attendance_batches ADD account_id INT UNSIGNED DEFAULT NULL, ADD store_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_attendance_batches ADD CONSTRAINT FK_22FA5C729B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_attendance_batches ADD CONSTRAINT FK_22FA5C72B092A811 FOREIGN KEY (store_id) REFERENCES daily_brew_stores (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_22FA5C729B6B5FBA ON daily_brew_attendance_batches (account_id)');
        $this->addSql('CREATE INDEX IDX_22FA5C72B092A811 ON daily_brew_attendance_batches (store_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_ATTENDANCE_BATCH_CANONICAL_LABEL ON daily_brew_attendance_batches (canonical_label, account_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_ATTENDANCE_BATCH_LABEL ON daily_brew_attendance_batches (label, account_id)');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD store_id INT UNSIGNED DEFAULT NULL, ADD account_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD CONSTRAINT FK_CD680F1CB092A811 FOREIGN KEY (store_id) REFERENCES daily_brew_stores (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD CONSTRAINT FK_CD680F1C9B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_CD680F1CB092A811 ON daily_brew_attendances (store_id)');
        $this->addSql('CREATE INDEX IDX_CD680F1C9B6B5FBA ON daily_brew_attendances (account_id)');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD account_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD CONSTRAINT FK_1C4A4D259B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_1C4A4D259B6B5FBA ON daily_brew_employee_evaluations (account_id)');
        $this->addSql('ALTER TABLE daily_brew_employees ADD account_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_employees ADD CONSTRAINT FK_370C3B6F9B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_370C3B6F9B6B5FBA ON daily_brew_employees (account_id)');
        $this->addSql('DROP INDEX UQ_EVALUATION_CRITERIA_CANONICAL_LABEL ON daily_brew_evaluation_criterias');
        $this->addSql('DROP INDEX UQ_EVALUATION_CRITERIA_LABEL ON daily_brew_evaluation_criterias');
        $this->addSql('ALTER TABLE daily_brew_evaluation_criterias ADD account_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_evaluation_criterias ADD CONSTRAINT FK_F5194DE79B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_F5194DE79B6B5FBA ON daily_brew_evaluation_criterias (account_id)');
        $this->addSql('CREATE UNIQUE INDEX UQ_EVALUATION_CRITERIA_CANONICAL_LABEL ON daily_brew_evaluation_criterias (canonical_label, account_id)');
        $this->addSql('CREATE UNIQUE INDEX UQ_EVALUATION_CRITERIA_LABEL ON daily_brew_evaluation_criterias (label, account_id)');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias ADD account_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias ADD CONSTRAINT FK_AC46DABB9B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_AC46DABB9B6B5FBA ON daily_brew_evaluation_template_criterias (account_id)');
        $this->addSql('DROP INDEX UQ_EVALUATION_TEMPLATE_CANONICAL_NAME ON daily_brew_evaluation_templates');
        $this->addSql('DROP INDEX UQ_EVALUATION_TEMPLATE_NAME ON daily_brew_evaluation_templates');
        $this->addSql('ALTER TABLE daily_brew_evaluation_templates ADD account_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_evaluation_templates ADD CONSTRAINT FK_1B36534F9B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_1B36534F9B6B5FBA ON daily_brew_evaluation_templates (account_id)');
        $this->addSql('CREATE UNIQUE INDEX UQ_EVALUATION_TEMPLATE_CANONICAL_NAME ON daily_brew_evaluation_templates (canonical_name, account_id)');
        $this->addSql('CREATE UNIQUE INDEX UQ_EVALUATION_TEMPLATE_NAME ON daily_brew_evaluation_templates (name, account_id)');
        $this->addSql('ALTER TABLE daily_brew_stores ADD account_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_stores ADD CONSTRAINT FK_446B00FC9B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_446B00FC9B6B5FBA ON daily_brew_stores (account_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_attendance_batches DROP FOREIGN KEY FK_22FA5C729B6B5FBA');
        $this->addSql('ALTER TABLE daily_brew_attendances DROP FOREIGN KEY FK_CD680F1C9B6B5FBA');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP FOREIGN KEY FK_1C4A4D259B6B5FBA');
        $this->addSql('ALTER TABLE daily_brew_employees DROP FOREIGN KEY FK_370C3B6F9B6B5FBA');
        $this->addSql('ALTER TABLE daily_brew_evaluation_criterias DROP FOREIGN KEY FK_F5194DE79B6B5FBA');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias DROP FOREIGN KEY FK_AC46DABB9B6B5FBA');
        $this->addSql('ALTER TABLE daily_brew_evaluation_templates DROP FOREIGN KEY FK_1B36534F9B6B5FBA');
        $this->addSql('ALTER TABLE daily_brew_stores DROP FOREIGN KEY FK_446B00FC9B6B5FBA');
        $this->addSql('CREATE TABLE daily_brew_settings (id INT UNSIGNED AUTO_INCREMENT NOT NULL, owner_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', name VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, value VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, INDEX IDX_63B03ADA7E3C61F9 (owner_id), UNIQUE INDEX UNIQ_63B03ADAB5B48B91 (public_id), UNIQUE INDEX UNIQ_SETTING_NAME (name), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE daily_brew_settings ADD CONSTRAINT FK_63B03ADA7E3C61F9 FOREIGN KEY (owner_id) REFERENCES daily_brew_users (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE account_user DROP FOREIGN KEY FK_10051E39B6B5FBA');
        $this->addSql('ALTER TABLE account_user DROP FOREIGN KEY FK_10051E3A76ED395');
        $this->addSql('ALTER TABLE daily_brew_user_settings DROP FOREIGN KEY FK_EB53CBA0A76ED395');
        $this->addSql('DROP TABLE account');
        $this->addSql('DROP TABLE account_user');
        $this->addSql('DROP TABLE daily_brew_user_settings');
        $this->addSql('ALTER TABLE daily_brew_attendance_batches DROP FOREIGN KEY FK_22FA5C72B092A811');
        $this->addSql('DROP INDEX IDX_22FA5C729B6B5FBA ON daily_brew_attendance_batches');
        $this->addSql('DROP INDEX IDX_22FA5C72B092A811 ON daily_brew_attendance_batches');
        $this->addSql('DROP INDEX UNIQ_ATTENDANCE_BATCH_LABEL ON daily_brew_attendance_batches');
        $this->addSql('DROP INDEX UNIQ_ATTENDANCE_BATCH_CANONICAL_LABEL ON daily_brew_attendance_batches');
        $this->addSql('ALTER TABLE daily_brew_attendance_batches DROP account_id, DROP store_id');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_ATTENDANCE_BATCH_LABEL ON daily_brew_attendance_batches (label, user_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_ATTENDANCE_BATCH_CANONICAL_LABEL ON daily_brew_attendance_batches (canonical_label, user_id)');
        $this->addSql('ALTER TABLE daily_brew_attendances DROP FOREIGN KEY FK_CD680F1CB092A811');
        $this->addSql('DROP INDEX IDX_CD680F1CB092A811 ON daily_brew_attendances');
        $this->addSql('DROP INDEX IDX_CD680F1C9B6B5FBA ON daily_brew_attendances');
        $this->addSql('ALTER TABLE daily_brew_attendances DROP store_id, DROP account_id');
        $this->addSql('DROP INDEX IDX_1C4A4D259B6B5FBA ON daily_brew_employee_evaluations');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP account_id');
        $this->addSql('DROP INDEX IDX_370C3B6F9B6B5FBA ON daily_brew_employees');
        $this->addSql('ALTER TABLE daily_brew_employees DROP account_id');
        $this->addSql('DROP INDEX IDX_F5194DE79B6B5FBA ON daily_brew_evaluation_criterias');
        $this->addSql('DROP INDEX UQ_EVALUATION_CRITERIA_LABEL ON daily_brew_evaluation_criterias');
        $this->addSql('DROP INDEX UQ_EVALUATION_CRITERIA_CANONICAL_LABEL ON daily_brew_evaluation_criterias');
        $this->addSql('ALTER TABLE daily_brew_evaluation_criterias DROP account_id');
        $this->addSql('CREATE UNIQUE INDEX UQ_EVALUATION_CRITERIA_LABEL ON daily_brew_evaluation_criterias (label, user_id)');
        $this->addSql('CREATE UNIQUE INDEX UQ_EVALUATION_CRITERIA_CANONICAL_LABEL ON daily_brew_evaluation_criterias (canonical_label, user_id)');
        $this->addSql('DROP INDEX IDX_AC46DABB9B6B5FBA ON daily_brew_evaluation_template_criterias');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias DROP account_id');
        $this->addSql('DROP INDEX IDX_1B36534F9B6B5FBA ON daily_brew_evaluation_templates');
        $this->addSql('DROP INDEX UQ_EVALUATION_TEMPLATE_NAME ON daily_brew_evaluation_templates');
        $this->addSql('DROP INDEX UQ_EVALUATION_TEMPLATE_CANONICAL_NAME ON daily_brew_evaluation_templates');
        $this->addSql('ALTER TABLE daily_brew_evaluation_templates DROP account_id');
        $this->addSql('CREATE UNIQUE INDEX UQ_EVALUATION_TEMPLATE_NAME ON daily_brew_evaluation_templates (name, user_id)');
        $this->addSql('CREATE UNIQUE INDEX UQ_EVALUATION_TEMPLATE_CANONICAL_NAME ON daily_brew_evaluation_templates (canonical_name, user_id)');
        $this->addSql('DROP INDEX IDX_446B00FC9B6B5FBA ON daily_brew_stores');
        $this->addSql('ALTER TABLE daily_brew_stores DROP account_id');
    }
}
