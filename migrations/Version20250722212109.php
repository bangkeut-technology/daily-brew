<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250722212109 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_employee_evaluations (id INT UNSIGNED AUTO_INCREMENT NOT NULL, employee_id INT UNSIGNED NOT NULL, evaluator_id INT UNSIGNED NOT NULL, template_id INT UNSIGNED DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', identifier VARCHAR(255) NOT NULL, template_name VARCHAR(255) NOT NULL, evaluated_at DATE NOT NULL COMMENT \'(DC2Type:date_immutable)\', note LONGTEXT DEFAULT NULL, average_score DOUBLE PRECISION NOT NULL, INDEX IDX_1C4A4D258C03F15C (employee_id), INDEX IDX_1C4A4D2543575BE2 (evaluator_id), INDEX IDX_1C4A4D255DA0FB8 (template_id), UNIQUE INDEX UQ_EMPLOYEE_EVALUATION (evaluated_at, employee_id, template_name), UNIQUE INDEX UQ_EMPLOYEE_EVALUATION_IDENTIFIER (identifier), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_employee_scores (id INT UNSIGNED AUTO_INCREMENT NOT NULL, evaluation_id INT UNSIGNED NOT NULL, criteria_id INT UNSIGNED DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', criteria_label VARCHAR(255) NOT NULL, score INT NOT NULL, weight INT NOT NULL, comment LONGTEXT DEFAULT NULL, INDEX IDX_4BEC1C03456C5646 (evaluation_id), INDEX IDX_4BEC1C03990BEA15 (criteria_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_employees (id INT UNSIGNED AUTO_INCREMENT NOT NULL, store_id INT UNSIGNED DEFAULT NULL, user_id INT UNSIGNED NOT NULL, linked_user_id INT UNSIGNED DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, phone_number VARCHAR(20) DEFAULT NULL, dob DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', joined_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', status VARCHAR(255) NOT NULL, identifier VARCHAR(32) NOT NULL, INDEX IDX_370C3B6FB092A811 (store_id), INDEX IDX_370C3B6FA76ED395 (user_id), UNIQUE INDEX UNIQ_370C3B6FCC26EB02 (linked_user_id), UNIQUE INDEX UNQ_EMPLOYEE_IDENTIFIER (identifier), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_employee_roles (employee_id INT UNSIGNED NOT NULL, role_id INT UNSIGNED NOT NULL, INDEX IDX_63052DE68C03F15C (employee_id), INDEX IDX_63052DE6D60322AC (role_id), PRIMARY KEY(employee_id, role_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_employee_templates (employee_id INT UNSIGNED NOT NULL, evaluation_template_id INT UNSIGNED NOT NULL, INDEX IDX_BFEBC2EF8C03F15C (employee_id), INDEX IDX_BFEBC2EF56839BCF (evaluation_template_id), PRIMARY KEY(employee_id, evaluation_template_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_evaluation_criterias (id INT UNSIGNED AUTO_INCREMENT NOT NULL, user_id INT UNSIGNED NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', identifier VARCHAR(255) NOT NULL, label VARCHAR(255) NOT NULL, canonical_label VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, weight INT NOT NULL, INDEX IDX_F5194DE7A76ED395 (user_id), UNIQUE INDEX UQ_EVALUATION_CRITERIA_IDENTIFIER (identifier), UNIQUE INDEX UQ_EVALUATION_CRITERIA_LABEL (label, user_id), UNIQUE INDEX UQ_EVALUATION_CRITERIA_CANONICAL_LABEL (canonical_label, user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_evaluation_template_criterias (id INT UNSIGNED AUTO_INCREMENT NOT NULL, template_id INT UNSIGNED DEFAULT NULL, criteria_id INT UNSIGNED DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', weight INT NOT NULL, INDEX IDX_AC46DABB5DA0FB8 (template_id), INDEX IDX_AC46DABB990BEA15 (criteria_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_evaluation_templates (id INT UNSIGNED AUTO_INCREMENT NOT NULL, user_id INT UNSIGNED NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', identifier VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, canonical_name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, active TINYINT(1) NOT NULL, INDEX IDX_1B36534FA76ED395 (user_id), UNIQUE INDEX UQ_EVALUATION_TEMPLATE_NAME (name, user_id), UNIQUE INDEX UQ_EVALUATION_TEMPLATE_CANONICAL_NAME (canonical_name, user_id), UNIQUE INDEX UQ_EVALUATION_TEMPLATE_IDENTIFIER (identifier), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_refresh_tokens (id INT AUTO_INCREMENT NOT NULL, refresh_token VARCHAR(128) NOT NULL, username VARCHAR(255) NOT NULL, valid DATETIME NOT NULL, UNIQUE INDEX UNIQ_A69AE9B9C74F2195 (refresh_token), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_roles (id INT UNSIGNED AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', name VARCHAR(100) NOT NULL, canonical_name VARCHAR(100) NOT NULL, description LONGTEXT DEFAULT NULL, UNIQUE INDEX UNQ_ROLE_NAME (name), UNIQUE INDEX UNQ_ROLE_NAME_CANONICAL (canonical_name), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_stores (id INT UNSIGNED AUTO_INCREMENT NOT NULL, user_id INT UNSIGNED DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', name VARCHAR(255) NOT NULL, canonical_name VARCHAR(255) NOT NULL, identifier VARCHAR(32) NOT NULL, INDEX IDX_446B00FCA76ED395 (user_id), UNIQUE INDEX UNIQ_STORE_NAME (name, user_id), UNIQUE INDEX UNIQ_STORE_CANONICAL_NAME (canonical_name, user_id), UNIQUE INDEX UNIQ_STORE_IDENTIFIER (identifier), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE daily_brew_users (id INT UNSIGNED AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', secret VARCHAR(225) NOT NULL, email VARCHAR(180) NOT NULL, email_canonical VARCHAR(180) NOT NULL, roles JSON NOT NULL, first_name VARCHAR(150) DEFAULT NULL, last_name VARCHAR(150) DEFAULT NULL, dob DATE DEFAULT NULL COMMENT \'(DC2Type:date_immutable)\', image_name VARCHAR(255) DEFAULT NULL, file_size INT DEFAULT NULL, original_name VARCHAR(255) DEFAULT NULL, mime_type VARCHAR(255) DEFAULT NULL, dimensions JSON DEFAULT NULL, password VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, locale VARCHAR(5) DEFAULT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL_CANONICAL (email_canonical), UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL_SECRET (secret), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD CONSTRAINT FK_1C4A4D258C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id)');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD CONSTRAINT FK_1C4A4D2543575BE2 FOREIGN KEY (evaluator_id) REFERENCES daily_brew_users (id)');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations ADD CONSTRAINT FK_1C4A4D255DA0FB8 FOREIGN KEY (template_id) REFERENCES daily_brew_evaluation_templates (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_employee_scores ADD CONSTRAINT FK_4BEC1C03456C5646 FOREIGN KEY (evaluation_id) REFERENCES daily_brew_employee_evaluations (id)');
        $this->addSql('ALTER TABLE daily_brew_employee_scores ADD CONSTRAINT FK_4BEC1C03990BEA15 FOREIGN KEY (criteria_id) REFERENCES daily_brew_evaluation_template_criterias (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_employees ADD CONSTRAINT FK_370C3B6FB092A811 FOREIGN KEY (store_id) REFERENCES daily_brew_stores (id)');
        $this->addSql('ALTER TABLE daily_brew_employees ADD CONSTRAINT FK_370C3B6FA76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id)');
        $this->addSql('ALTER TABLE daily_brew_employees ADD CONSTRAINT FK_370C3B6FCC26EB02 FOREIGN KEY (linked_user_id) REFERENCES daily_brew_users (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE daily_brew_employee_roles ADD CONSTRAINT FK_63052DE68C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_employee_roles ADD CONSTRAINT FK_63052DE6D60322AC FOREIGN KEY (role_id) REFERENCES daily_brew_roles (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_employee_templates ADD CONSTRAINT FK_BFEBC2EF8C03F15C FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_employee_templates ADD CONSTRAINT FK_BFEBC2EF56839BCF FOREIGN KEY (evaluation_template_id) REFERENCES daily_brew_evaluation_templates (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_evaluation_criterias ADD CONSTRAINT FK_F5194DE7A76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id)');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias ADD CONSTRAINT FK_AC46DABB5DA0FB8 FOREIGN KEY (template_id) REFERENCES daily_brew_evaluation_templates (id)');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias ADD CONSTRAINT FK_AC46DABB990BEA15 FOREIGN KEY (criteria_id) REFERENCES daily_brew_evaluation_criterias (id)');
        $this->addSql('ALTER TABLE daily_brew_evaluation_templates ADD CONSTRAINT FK_1B36534FA76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id)');
        $this->addSql('ALTER TABLE daily_brew_stores ADD CONSTRAINT FK_446B00FCA76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP FOREIGN KEY FK_1C4A4D258C03F15C');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP FOREIGN KEY FK_1C4A4D2543575BE2');
        $this->addSql('ALTER TABLE daily_brew_employee_evaluations DROP FOREIGN KEY FK_1C4A4D255DA0FB8');
        $this->addSql('ALTER TABLE daily_brew_employee_scores DROP FOREIGN KEY FK_4BEC1C03456C5646');
        $this->addSql('ALTER TABLE daily_brew_employee_scores DROP FOREIGN KEY FK_4BEC1C03990BEA15');
        $this->addSql('ALTER TABLE daily_brew_employees DROP FOREIGN KEY FK_370C3B6FB092A811');
        $this->addSql('ALTER TABLE daily_brew_employees DROP FOREIGN KEY FK_370C3B6FA76ED395');
        $this->addSql('ALTER TABLE daily_brew_employees DROP FOREIGN KEY FK_370C3B6FCC26EB02');
        $this->addSql('ALTER TABLE daily_brew_employee_roles DROP FOREIGN KEY FK_63052DE68C03F15C');
        $this->addSql('ALTER TABLE daily_brew_employee_roles DROP FOREIGN KEY FK_63052DE6D60322AC');
        $this->addSql('ALTER TABLE daily_brew_employee_templates DROP FOREIGN KEY FK_BFEBC2EF8C03F15C');
        $this->addSql('ALTER TABLE daily_brew_employee_templates DROP FOREIGN KEY FK_BFEBC2EF56839BCF');
        $this->addSql('ALTER TABLE daily_brew_evaluation_criterias DROP FOREIGN KEY FK_F5194DE7A76ED395');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias DROP FOREIGN KEY FK_AC46DABB5DA0FB8');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias DROP FOREIGN KEY FK_AC46DABB990BEA15');
        $this->addSql('ALTER TABLE daily_brew_evaluation_templates DROP FOREIGN KEY FK_1B36534FA76ED395');
        $this->addSql('ALTER TABLE daily_brew_stores DROP FOREIGN KEY FK_446B00FCA76ED395');
        $this->addSql('DROP TABLE daily_brew_employee_evaluations');
        $this->addSql('DROP TABLE daily_brew_employee_scores');
        $this->addSql('DROP TABLE daily_brew_employees');
        $this->addSql('DROP TABLE daily_brew_employee_roles');
        $this->addSql('DROP TABLE daily_brew_employee_templates');
        $this->addSql('DROP TABLE daily_brew_evaluation_criterias');
        $this->addSql('DROP TABLE daily_brew_evaluation_template_criterias');
        $this->addSql('DROP TABLE daily_brew_evaluation_templates');
        $this->addSql('DROP TABLE daily_brew_refresh_tokens');
        $this->addSql('DROP TABLE daily_brew_roles');
        $this->addSql('DROP TABLE daily_brew_stores');
        $this->addSql('DROP TABLE daily_brew_users');
    }
}
