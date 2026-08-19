<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Card check-in: a physical card tapped at a kiosk, for staff with no phone and
 * no account. See docs/card-checkin.md.
 *
 * Four tables and one flag:
 *
 * - employee_cards — the cards themselves. `public_id` is the protocol's
 *   passId, so it is the card's id and not the employee's: a lost card is
 *   revoked and replaced for the same person, and the two must stay
 *   distinguishable.
 * - workspace_issuer_keys — one signing keypair per workspace, never
 *   platform-wide. Several rows may exist: rotation retires a key without
 *   deleting it, because its public half still has to verify cards already in
 *   pockets.
 * - card_taps — the replay guard. An issued pass consumes no nonce and carries
 *   no signed tap time, so a re-submitted offline queue would otherwise punch
 *   twice, and a second punch is a *check-out*.
 * - tap_nonces — anti-passback bookkeeping, as a unique key rather than a cache
 *   entry, because PSR-6 has no compare-and-set and two simultaneous taps would
 *   both find the slot empty.
 *
 * Nothing is back-filled. Every workspace starts with card check-in off and no
 * signing key; the key is minted the first time a card is issued.
 */
final class Version20260819120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Card check-in: employee cards, workspace issuer keys, tap replay guard, nonce store.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE TABLE daily_brew_workspace_issuer_keys (
                id INT AUTO_INCREMENT NOT NULL,
                workspace_id INT NOT NULL,
                public_key_pem LONGTEXT NOT NULL,
                private_key_encrypted LONGTEXT NOT NULL,
                created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
                retired_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
                INDEX idx_issuer_key_workspace (workspace_id),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TABLE daily_brew_employee_cards (
                id INT AUTO_INCREMENT NOT NULL,
                public_id VARCHAR(36) NOT NULL,
                employee_id INT NOT NULL,
                workspace_id INT NOT NULL,
                label VARCHAR(100) NOT NULL,
                not_before DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
                not_after DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
                created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
                issued_by_email VARCHAR(180) DEFAULT NULL,
                revoked_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
                revoked_by_email VARCHAR(180) DEFAULT NULL,
                revoke_reason VARCHAR(255) DEFAULT NULL,
                UNIQUE INDEX uniq_employee_card_public_id (public_id),
                INDEX idx_employee_card_workspace (workspace_id),
                INDEX idx_employee_card_employee (employee_id),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TABLE daily_brew_card_taps (
                id INT AUTO_INCREMENT NOT NULL,
                pass_id VARCHAR(36) NOT NULL,
                terminal_id VARCHAR(64) NOT NULL,
                tapped_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
                workspace_id INT NOT NULL,
                card_id INT DEFAULT NULL,
                offline_batch TINYINT(1) NOT NULL,
                recorded_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
                UNIQUE INDEX uniq_card_tap (pass_id, terminal_id, tapped_at),
                INDEX idx_card_tap_workspace (workspace_id),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TABLE daily_brew_tap_nonces (
                id INT AUTO_INCREMENT NOT NULL,
                scope VARCHAR(100) NOT NULL,
                token VARCHAR(128) NOT NULL,
                expires_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
                UNIQUE INDEX uniq_tap_nonce (scope, token),
                INDEX idx_tap_nonce_expiry (expires_at),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);

        $this->addSql('ALTER TABLE daily_brew_workspace_issuer_keys ADD CONSTRAINT FK_issuer_key_workspace FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_employee_cards ADD CONSTRAINT FK_employee_card_employee FOREIGN KEY (employee_id) REFERENCES daily_brew_employees (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_employee_cards ADD CONSTRAINT FK_employee_card_workspace FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_card_taps ADD CONSTRAINT FK_card_tap_workspace FOREIGN KEY (workspace_id) REFERENCES daily_brew_workspaces (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE daily_brew_card_taps ADD CONSTRAINT FK_card_tap_card FOREIGN KEY (card_id) REFERENCES daily_brew_employee_cards (id) ON DELETE SET NULL');

        $this->addSql('ALTER TABLE daily_brew_workspace_settings ADD card_checkin_enabled TINYINT(1) DEFAULT 0 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_workspace_settings DROP card_checkin_enabled');
        $this->addSql('DROP TABLE daily_brew_card_taps');
        $this->addSql('DROP TABLE daily_brew_tap_nonces');
        $this->addSql('DROP TABLE daily_brew_employee_cards');
        $this->addSql('DROP TABLE daily_brew_workspace_issuer_keys');
    }
}
