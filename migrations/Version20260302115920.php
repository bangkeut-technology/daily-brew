<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260302115920 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias DROP FOREIGN KEY FK_AC46DABB82D40A1F');
        $this->addSql('DROP INDEX IDX_AC46DABB82D40A1F ON daily_brew_evaluation_template_criterias');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias DROP workspace_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias ADD workspace_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias ADD CONSTRAINT FK_AC46DABB82D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_AC46DABB82D40A1F ON daily_brew_evaluation_template_criterias (workspace_id)');
    }
}
