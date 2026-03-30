<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260330041759 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Add column as nullable first, populate, then make NOT NULL
        $this->addSql('ALTER TABLE daily_brew_employees ADD qr_token VARCHAR(24) DEFAULT NULL');

        // Generate unique tokens for existing employees
        $employees = $this->connection->fetchAllAssociative('SELECT id FROM daily_brew_employees');
        $chars = 'abcdefghjkmnpqrstuvwxyz23456789';
        $charsLen = strlen($chars);
        foreach ($employees as $row) {
            $token = '';
            for ($i = 0; $i < 20; $i++) {
                $token .= $chars[random_int(0, $charsLen - 1)];
            }
            $this->addSql('UPDATE daily_brew_employees SET qr_token = ? WHERE id = ?', [$token, $row['id']]);
        }

        $this->addSql('ALTER TABLE daily_brew_employees CHANGE qr_token qr_token VARCHAR(24) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_370C3B6F1AE26361 ON daily_brew_employees (qr_token)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_370C3B6F1AE26361 ON daily_brew_employees');
        $this->addSql('ALTER TABLE daily_brew_employees DROP qr_token');
    }
}
