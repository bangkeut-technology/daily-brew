# CLAUDE.md (Backend)

DailyBrew Backend --- Symfony API powering the Admin Console and Mobile
App.

## Commands

composer install

composer cs composer stan composer test

php bin/console doctrine:migrations:migrate

npm ci npm run router:generate npm run dev

## Architecture

API prefix: /api/v1/{\_locale}

Locales: en, fr, km

Controllers live in: src/ApiController/

Controller pattern: Controller + Trait

Traits: src/ApiController/Trait/

Business logic should live in: src/Service/

## Multi-Tenancy

Workspace is the root aggregate.

All business entities must respect workspace boundaries.

Authorization handled by: WorkspaceVoter

src/Security/Voter/WorkspaceVoter.php

## Authentication

JWT authentication.

Keys stored in: config/jwt/

Generate keys:

php bin/console lexik:jwt:generate-keypair

## Domain Events

Doctrine subscribers live in:

src/EventSubscriber/

Used for lifecycle events and async actions via Symfony Messenger.

## Business Rules

Attendance: - immutable after submission

Payroll: - read-only for employees

Leave: - employees may submit requests

Workspace: - every query must respect workspace scope
