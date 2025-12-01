<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251201040547 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE daily_brew_account_users (id INT UNSIGNED AUTO_INCREMENT NOT NULL, account_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', role VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_CC97F3FDB5B48B91 (public_id), INDEX IDX_CC97F3FD9B6B5FBA (account_id), INDEX IDX_CC97F3FDA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE daily_brew_account_users ADD CONSTRAINT FK_CC97F3FD9B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id)');
        $this->addSql('ALTER TABLE daily_brew_account_users ADD CONSTRAINT FK_CC97F3FDA76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id)');
        $this->addSql('ALTER TABLE account_user DROP FOREIGN KEY FK_10051E39B6B5FBA');
        $this->addSql('ALTER TABLE account_user DROP FOREIGN KEY FK_10051E3A76ED395');
        $this->addSql('DROP TABLE account_user');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE account_user (id INT UNSIGNED AUTO_INCREMENT NOT NULL, account_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NOT NULL, role VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, public_id VARCHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_10051E39B6B5FBA (account_id), INDEX IDX_10051E3A76ED395 (user_id), UNIQUE INDEX UNIQ_10051E3B5B48B91 (public_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE account_user ADD CONSTRAINT FK_10051E39B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE account_user ADD CONSTRAINT FK_10051E3A76ED395 FOREIGN KEY (user_id) REFERENCES daily_brew_users (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE daily_brew_account_users DROP FOREIGN KEY FK_CC97F3FD9B6B5FBA');
        $this->addSql('ALTER TABLE daily_brew_account_users DROP FOREIGN KEY FK_CC97F3FDA76ED395');
        $this->addSql('DROP TABLE daily_brew_account_users');
    }
}
