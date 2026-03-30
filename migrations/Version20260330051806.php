<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260330051806 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_employees DROP INDEX UNIQ_370C3B6FCC26EB02, ADD INDEX IDX_370C3B6FCC26EB02 (linked_user_id)');
        $this->addSql('CREATE UNIQUE INDEX unique_linked_user_workspace ON daily_brew_employees (linked_user_id, workspace_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_employees DROP INDEX IDX_370C3B6FCC26EB02, ADD UNIQUE INDEX UNIQ_370C3B6FCC26EB02 (linked_user_id)');
        $this->addSql('DROP INDEX unique_linked_user_workspace ON daily_brew_employees');
    }
}
