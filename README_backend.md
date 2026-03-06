# DailyBrew Backend

Symfony API powering DailyBrew.

## Commands

composer install composer cs composer stan composer test

php bin/console doctrine:migrations:migrate

## Architecture

-   API prefix: /api/v1/{locale}
-   Controller + Trait pattern
-   Services contain business logic

## Multi‑Tenancy

Workspace is the root aggregate. All entities must respect workspace
scope.

## Security

JWT authentication. Keys stored in config/jwt.
