<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds scopes and a signing secret to API tokens, for the integrations ingest.
 *
 * Existing rows are back-filled to `["attendance:read"]`: a migration must never
 * hand a key that already exists a capability its owner never asked for, and
 * write access to attendance is what payroll gets reconciled against.
 *
 * signing_secret is left NULL on those rows. They keep working for the
 * BasilBook pull (bearer auth), but can never sign a request — the secret is
 * only ever generated at mint time, so gaining write access means minting a new
 * token.
 */
final class Version20260812090000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add ApiToken scopes + signing secret; back-fill existing tokens to read-only.';
    }

    public function up(Schema $schema): void
    {
        // Expression default (MySQL 8.0.13+), the same shape employees.manager_permissions
        // uses: it fills existing rows on the ALTER, so no separate back-fill pass and no
        // window where the column is nullable.
        $this->addSql("ALTER TABLE daily_brew_api_tokens ADD scopes JSON NOT NULL DEFAULT (JSON_ARRAY('attendance:read')), ADD signing_secret LONGTEXT DEFAULT NULL");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_api_tokens DROP scopes, DROP signing_secret');
    }
}
