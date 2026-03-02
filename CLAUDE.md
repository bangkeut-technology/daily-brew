# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# PHP dependencies
composer install

# Code style (dry-run) / fix
composer cs
composer cs -- --dry-run

# Static analysis
composer stan

# Tests (all / single file)
composer test
php bin/phpunit tests/path/to/SomeTest.php

# Database
php bin/console doctrine:migrations:migrate
php bin/console doctrine:migrations:migrate --env=test

# Frontend dependencies & build
npm ci
npm run router:generate   # MUST run before any asset build
npm run dev               # single build
npm run watch             # watch mode
npm run dev-server        # HMR dev server
npm run build             # production build
npm run lint:fix
```

## PHP Architecture

### API Routing
All REST endpoints are registered under `/api/v1/{_locale}` (locale: `en|fr|km`) from `src/ApiController/`. Route names are prefixed `daily_brew_api_v1_`. See `config/routes.yaml`.

### Controller + Trait Pattern
API controllers in `src/ApiController/` compose behaviour via PHP traits from `src/ApiController/Trait/`. Each controller class uses multiple traits, keeping individual files small. For example, `UserController` uses `UserTrait`, `EmployeeTrait`, and `WorkspaceTrait`.

When adding a new API action:
1. Implement the method in the relevant `Trait/*.php`.
2. Use the trait in the appropriate controller.
3. Annotate with `#[Route]` + OpenAPI `#[OA\*]` attributes for Swagger.

All controllers extend `App\Controller\AbstractController` (not Symfony's base directly).

### Multi-Tenancy
`Workspace` is the root aggregate. Virtually all business data (stores, employees, evaluations, attendance) is scoped to a workspace. Use `WorkspaceVoter` (`src/Security/Voter/WorkspaceVoter.php`) for authorization checks on workspace-owned resources.

### Authentication & Security
- `src/Security/AbstractJsonAuthenticator.php` — base JWT authenticator
- `src/Security/JsonAuthenticator.php` — credential login
- `src/Security/OAuthAuthenticationService.php` — OAuth2 flow (Google, Facebook, LinkedIn, Microsoft, Apple via `knpu/oauth2-client-bundle`)
- `src/Security/Provider/UserProvider.php` — Symfony user provider
- JWT keys in `config/jwt/`; generate with `php bin/console lexik:jwt:generate-keypair`

### Domain Events
`src/EventSubscriber/` contains Doctrine event subscribers (one per aggregate: `UserSubscriber`, `EmployeeSubscriber`, `AttendanceSubscriber`, etc.). These fire on Doctrine lifecycle events (`postPersist`, `postUpdate`, `postRemove`) and use Symfony Messenger for async side-effects. `ApiExceptionSubscriber` handles converting exceptions to JSON API responses.

### Forms (DTOs / Validation)
`src/Form/` uses Symfony Form types extending `AbstractFormType`. Forms serve as request DTOs for API endpoints — they validate and hydrate data before it reaches the service layer.

### Async Jobs
Symfony Messenger with the Doctrine transport (`MESSENGER_TRANSPORT_DSN`). Message handlers live in `src/MessageHandler/`.

### Key Service Layer
`src/Service/` contains: `WorkspaceService`, `WorkspaceUserService`, `WorkspaceInviteService`, `SettingService`, `AttendanceRateCalculator`, `AccountDeletionService`, `DemoSessionCleanUpService`.

## React Dashboard (assets/)

### Stack
React 19 · TanStack Router (file-based) · TanStack Query · Axios · react-hook-form + Yup · Radix UI · Tailwind CSS · react-i18next · Sonner (toasts) · Recharts

### Route Layout
- `assets/src/routes/_layout/` — public pages (sign-in, sign-up, forgot-password, marketing pages)
- `assets/src/routes/console/_authenticated/_layout/` — authenticated admin area (employees, evaluations, attendance, manage, settings, profile)
- `routeTree.gen.ts` is **auto-generated** — do not edit manually, run `npm run router:generate`

### Path Alias
`@/` maps to `assets/src/` (configured in `webpack.config.js`). Always use `@/` for imports within the dashboard.

### API Services
Each domain has a dedicated service file in `assets/src/services/` (e.g., `auth.ts`, `employee.ts`, `attendance.ts`). These use Axios. Mutations and queries are handled via TanStack Query in route/component files.

### Validation
Yup schemas in `assets/src/schema/`. Use `yupResolver` from `@hookform/resolvers/yup` with `react-hook-form`.

## Testing

- Framework: PHPUnit 12 + SymfonyExtension + DAMA DoctrineTestBundle (transaction isolation per test)
- All tests live under `tests/`; bootstrap at `tests/bootstrap.php`
- Test DB configured in `.env.test` (SQLite locally or a separate MySQL 8.4 DB in CI)
- CI (`.github/workflows/ci.yaml`) uses MySQL 8.4; local dev uses PostgreSQL 16 (`compose.yaml`)
