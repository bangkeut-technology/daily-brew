<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260302011553 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings DROP FOREIGN KEY FK_D829DC9670574616');
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings DROP FOREIGN KEY FK_D829DC9682D40A1F');
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings DROP FOREIGN KEY FK_D829DC96BD992930');
        $this->addSql('DROP TABLE daily_brew_workspace_user_ratings');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_workspace_user_ratings (id INT UNSIGNED AUTO_INCREMENT NOT NULL, reviewer_id INT UNSIGNED NOT NULL, reviewee_id INT UNSIGNED NOT NULL, workspace_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', score SMALLINT NOT NULL, comment LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, period DATE DEFAULT NULL COMMENT \'(DC2Type:date_immutable)\', deleted_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_D829DC96B5B48B91 (public_id), UNIQUE INDEX UNIQ_RATING_PAIR_PERIOD (reviewer_id, reviewee_id, workspace_id, period), INDEX IDX_D829DC9670574616 (reviewer_id), INDEX IDX_D829DC96BD992930 (reviewee_id), INDEX IDX_D829DC9682D40A1F (workspace_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings ADD CONSTRAINT FK_D829DC9670574616 FOREIGN KEY (reviewer_id) REFERENCES daily_brew_users (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings ADD CONSTRAINT FK_D829DC9682D40A1F FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_workspace_user_ratings ADD CONSTRAINT FK_D829DC96BD992930 FOREIGN KEY (reviewee_id) REFERENCES daily_brew_users (id) ON UPDATE NO ACTION ON DELETE CASCADE');
    }
}
