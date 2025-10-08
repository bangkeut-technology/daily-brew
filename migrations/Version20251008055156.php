<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251008055156 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_demo_sessions RENAME INDEX uniq_8201c815b5b48b91 TO UNIQ_76512A28B5B48B91');
        $this->addSql('ALTER TABLE daily_brew_demo_sessions RENAME INDEX idx_8201c815a76ed395 TO IDX_76512A28A76ED395');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE daily_brew_demo_sessions RENAME INDEX idx_76512a28a76ed395 TO IDX_8201C815A76ED395');
        $this->addSql('ALTER TABLE daily_brew_demo_sessions RENAME INDEX uniq_76512a28b5b48b91 TO UNIQ_8201C815B5B48B91');
    }
}
