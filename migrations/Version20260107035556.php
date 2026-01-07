<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260107035556 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_users DROP FOREIGN KEY FK_8B9302A77D65B4C4');
        $this->addSql('ALTER TABLE daily_brew_users ADD CONSTRAINT FK_8B9302A77D65B4C4 FOREIGN KEY (current_workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_users DROP FOREIGN KEY FK_8B9302A77D65B4C4');
        $this->addSql('ALTER TABLE daily_brew_users ADD CONSTRAINT FK_8B9302A77D65B4C4 FOREIGN KEY (current_workspace_id) REFERENCES daily_brew_workspace_users (id) ON UPDATE NO ACTION ON DELETE SET NULL');
    }
}
