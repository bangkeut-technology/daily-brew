<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260403064928 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove RevenueCat IAP columns (source, revenuecat_subscription_id) from subscriptions';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_subscriptions DROP source, DROP revenuecat_subscription_id');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE daily_brew_subscriptions ADD source VARCHAR(20) DEFAULT \'paddle\' NOT NULL, ADD revenuecat_subscription_id VARCHAR(255) DEFAULT NULL');
    }
}
