<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260327013433 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add canonical columns and updatedAt to closure';
    }

    public function up(Schema $schema): void
    {
        // Add columns as nullable first
        $this->addSql('ALTER TABLE closure ADD updated_at DATETIME DEFAULT NULL, ADD name_canonical VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE employee ADD name_canonical VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE shift ADD name_canonical VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE `user` ADD email_canonical VARCHAR(180) DEFAULT NULL');
        $this->addSql('ALTER TABLE workspace ADD name_canonical VARCHAR(255) DEFAULT NULL');

        // Populate canonical values from existing data
        $this->addSql('UPDATE closure SET name_canonical = LOWER(name), updated_at = created_at WHERE name_canonical IS NULL');
        $this->addSql('UPDATE employee SET name_canonical = LOWER(name) WHERE name_canonical IS NULL');
        $this->addSql('UPDATE shift SET name_canonical = LOWER(name) WHERE name_canonical IS NULL');
        $this->addSql('UPDATE `user` SET email_canonical = LOWER(email) WHERE email_canonical IS NULL');
        $this->addSql('UPDATE workspace SET name_canonical = LOWER(name) WHERE name_canonical IS NULL');

        // Now make columns NOT NULL
        $this->addSql('ALTER TABLE closure CHANGE updated_at updated_at DATETIME NOT NULL, CHANGE name_canonical name_canonical VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE employee CHANGE name_canonical name_canonical VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE shift CHANGE name_canonical name_canonical VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE `user` CHANGE email_canonical email_canonical VARCHAR(180) NOT NULL');
        $this->addSql('ALTER TABLE workspace CHANGE name_canonical name_canonical VARCHAR(255) NOT NULL');

        // Add unique index on email_canonical
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649A0D96FBF ON `user` (email_canonical)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE closure DROP updated_at, DROP name_canonical');
        $this->addSql('ALTER TABLE employee DROP name_canonical');
        $this->addSql('ALTER TABLE shift DROP name_canonical');
        $this->addSql('DROP INDEX UNIQ_8D93D649A0D96FBF ON `user`');
        $this->addSql('ALTER TABLE `user` DROP email_canonical');
        $this->addSql('ALTER TABLE workspace DROP name_canonical');
    }
}
