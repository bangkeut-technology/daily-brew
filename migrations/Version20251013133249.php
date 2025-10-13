<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251013133249 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias DROP FOREIGN KEY FK_AC46DABB5DA0FB8');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias DROP FOREIGN KEY FK_AC46DABB990BEA15');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias CHANGE template_id template_id INT UNSIGNED NOT NULL, CHANGE criteria_id criteria_id INT UNSIGNED NOT NULL');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias ADD CONSTRAINT FK_AC46DABB5DA0FB8 FOREIGN KEY (template_id) REFERENCES daily_brew_evaluation_templates (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias ADD CONSTRAINT FK_AC46DABB990BEA15 FOREIGN KEY (criteria_id) REFERENCES daily_brew_evaluation_criterias (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias DROP FOREIGN KEY FK_AC46DABB5DA0FB8');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias DROP FOREIGN KEY FK_AC46DABB990BEA15');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias CHANGE template_id template_id INT UNSIGNED DEFAULT NULL, CHANGE criteria_id criteria_id INT UNSIGNED DEFAULT NULL');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias ADD CONSTRAINT FK_AC46DABB5DA0FB8 FOREIGN KEY (template_id) REFERENCES daily_brew_evaluation_templates (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE daily_brew_evaluation_template_criterias ADD CONSTRAINT FK_AC46DABB990BEA15 FOREIGN KEY (criteria_id) REFERENCES daily_brew_evaluation_criterias (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
    }
}
