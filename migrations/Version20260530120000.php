<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds image upload columns to daily_brew_employees so owners can attach a
 * headshot to each staff record. Mirrors the same column layout User and
 * Workspace already use (image_name + file_size + original_name + mime_type +
 * dimensions json), kept nullable so existing rows continue to validate.
 * Vich UploaderBundle's `employees` mapping (configured in
 * config/packages/vich_uploader.yaml) writes the cropped 512×512 JPEG into
 * public/uploads/employees and stores the SmartUniqueNamer-generated
 * filename in image_name.
 */
final class Version20260530120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add image upload columns (image_name/file_size/original_name/mime_type/dimensions) to daily_brew_employees for employee photos.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_employees
            ADD image_name VARCHAR(255) DEFAULT NULL,
            ADD file_size INT DEFAULT NULL,
            ADD original_name VARCHAR(255) DEFAULT NULL,
            ADD mime_type VARCHAR(255) DEFAULT NULL,
            ADD dimensions JSON DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_employees
            DROP image_name,
            DROP file_size,
            DROP original_name,
            DROP mime_type,
            DROP dimensions');
    }
}
