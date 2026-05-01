<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260501123630 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add daily_brew_admin_audit_logs for append-only admin action history.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE daily_brew_admin_audit_logs (id INT AUTO_INCREMENT NOT NULL, public_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, actor_email VARCHAR(180) DEFAULT NULL, action VARCHAR(40) NOT NULL, target_type VARCHAR(30) NOT NULL, target_public_id VARCHAR(36) DEFAULT NULL, target_label VARCHAR(255) DEFAULT NULL, metadata JSON DEFAULT NULL, actor_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_8BCB49B0B5B48B91 (public_id), INDEX IDX_8BCB49B010DAF24A (actor_id), INDEX IDX_AUDIT_CREATED (created_at), INDEX IDX_AUDIT_TARGET (target_type, target_public_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE daily_brew_admin_audit_logs ADD CONSTRAINT FK_8BCB49B010DAF24A FOREIGN KEY (actor_id) REFERENCES daily_brew_users (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_admin_audit_logs DROP FOREIGN KEY FK_8BCB49B010DAF24A');
        $this->addSql('DROP TABLE daily_brew_admin_audit_logs');
    }
}
