<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260329061900 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add device verification columns to attendances and workspace settings';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_attendances ADD check_in_device_id VARCHAR(36) DEFAULT NULL, ADD check_in_device_name VARCHAR(255) DEFAULT NULL, ADD check_out_device_id VARCHAR(36) DEFAULT NULL, ADD check_out_device_name VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_workspace_settings ADD device_verification_enabled TINYINT DEFAULT 0 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_attendances DROP check_in_device_id, DROP check_in_device_name, DROP check_out_device_id, DROP check_out_device_name');
        $this->addSql('ALTER TABLE daily_brew_workspace_settings DROP device_verification_enabled');
    }
}
