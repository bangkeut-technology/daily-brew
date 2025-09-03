<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250903122953 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_attendances ADD leave_type VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_settings RENAME INDEX uniq_66b74ae3b5b48b91 TO UNIQ_63B03ADAB5B48B91');
        $this->addSql('ALTER TABLE daily_brew_settings RENAME INDEX idx_66b74ae37e3c61f9 TO IDX_63B03ADA7E3C61F9');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_attendances DROP leave_type');
        $this->addSql('ALTER TABLE daily_brew_settings RENAME INDEX idx_63b03ada7e3c61f9 TO IDX_66B74AE37E3C61F9');
        $this->addSql('ALTER TABLE daily_brew_settings RENAME INDEX uniq_63b03adab5b48b91 TO UNIQ_66B74AE3B5B48B91');
    }
}
