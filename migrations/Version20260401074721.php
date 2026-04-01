<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260401074721 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add role column to employees table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_employees ADD role VARCHAR(255) DEFAULT \'employee\' NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_employees DROP role');
    }
}
