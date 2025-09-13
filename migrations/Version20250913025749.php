<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250913025749 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_attendance_batches (id INT UNSIGNED AUTO_INCREMENT NOT NULL, user_id INT UNSIGNED DEFAULT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', type VARCHAR(255) NOT NULL, label VARCHAR(255) NOT NULL, canonical_label VARCHAR(255) NOT NULL, note LONGTEXT DEFAULT NULL, from_date DATE NOT NULL COMMENT \'(DC2Type:date_immutable)\', to_date DATE NOT NULL COMMENT \'(DC2Type:date_immutable)\', UNIQUE INDEX UNIQ_22FA5C72B5B48B91 (public_id), INDEX IDX_22FA5C72A76ED395 (user_id), UNIQUE INDEX UNIQ_ATTENDANCE_BATCH_LABEL (label, user_id), UNIQUE INDEX UNIQ_ATTENDANCE_BATCH_CANONICAL_LABEL (canonical_label, user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE daily_brew_attendance_batches ADD CONSTRAINT FK_22FA5C72A76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id)');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD batch_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_attendances ADD CONSTRAINT FK_CD680F1CF39EBE7A FOREIGN KEY (batch_id) REFERENCES daily_brew_attendance_batches (id)');
        $this->addSql('CREATE INDEX IDX_CD680F1CF39EBE7A ON daily_brew_attendances (batch_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_attendances DROP FOREIGN KEY FK_CD680F1CF39EBE7A');
        $this->addSql('ALTER TABLE daily_brew_attendance_batches DROP FOREIGN KEY FK_22FA5C72A76ED395');
        $this->addSql('DROP TABLE daily_brew_attendance_batches');
        $this->addSql('DROP INDEX IDX_CD680F1CF39EBE7A ON daily_brew_attendances');
        $this->addSql('ALTER TABLE daily_brew_attendances DROP batch_id');
    }
}
