<?php

/**
 * deploy.php — Deployer recipe for atomic, zero-downtime deploys.
 *
 * Replaces the in-place `cd /var/www/dailybrew && git checkout ... && composer
 * install` flow from .github/workflows/deploy.yaml. Each release builds into a
 * fresh `releases/<tag>/` directory while production keeps serving from
 * `current` → previous-release. An atomic symlink swap promotes the new
 * release; PHP-FPM is gracefully reloaded so in-flight requests are not cut.
 *
 * Operator cutover instructions live in deploy/DEPLOYER-CUTOVER.md.
 *
 * Run from CI:    vendor/bin/dep deploy production
 * Rollback:       vendor/bin/dep rollback production
 *
 * Hard requirements before first run:
 *   - composer require --dev deployer/deployer (locked, not auto-installed)
 *   - shared/.env.local on the host (per-host secrets)
 *   - shared/config/jwt/{private,public}.pem (LexikJWT keypair, persistent)
 *   - nginx root flipped from /var/www/dailybrew/public to
 *     /var/www/dailybrew/current/public
 *   - dailybrew-next.service WorkingDirectory flipped to
 *     /var/www/dailybrew/current/frontend/.next/standalone
 */

namespace Deployer;

require 'recipe/symfony.php';

// ── Project ─────────────────────────────────────────────────────────────────

set('application', 'dailybrew');
set('repository', 'git@github.com:bangkeut-technology/daily-brew.git');

// Use the release-please tag passed in by CI (DEPLOY_TAG). Locally falls back
// to whatever branch the operator is on. Tag overrides branch in Deployer's
// resolution, so this is the right shape.
set('target', static fn () => getenv('DEPLOY_TAG') ?: 'main');

// Keep 5 previous releases for fast rollback; older are garbage-collected by
// `deploy:cleanup`.
set('keep_releases', 5);

// What lives outside the release tree — per-host secrets, persistent files,
// long-lived logs.
add('shared_files', [
    '.env.local',                 // database password, Paddle/Telegram tokens
    'config/jwt/private.pem',     // LexikJWT keypair — never regenerate at deploy
    'config/jwt/public.pem',
]);
add('shared_dirs', [
    'var/log',                    // logs survive releases
    'public/uploads',             // user-uploaded avatars
]);

// Files Deployer creates fresh on every deploy but writes from the release
// tree (var/cache lives under the release; the symfony recipe handles this).
add('writable_dirs', [
    'var/cache',
    'var/log',
    'public/uploads',
]);

// ── Hosts ───────────────────────────────────────────────────────────────────
//
// Secrets resolve from GitHub Actions env vars at CI time. The same vars used
// by the legacy ssh-action flow.

host('production')
    ->setHostname(getenv('DEPLOY_HOST') ?: '')
    ->setRemoteUser(getenv('DEPLOY_USER') ?: '')
    ->setPort((int) (getenv('DEPLOY_PORT') ?: 22))
    ->setDeployPath(getenv('DEPLOY_PATH') ?: '/var/www/dailybrew')
    ->setLabels(['env' => 'prod']);

// ── Custom tasks ────────────────────────────────────────────────────────────

/**
 * Build the legacy SPA bundle. Runs `npm ci` + `router:generate` + `npm run
 * build` inside the new release dir. The Symfony Encore output lands in
 * `public/build/` which nginx serves with an immutable cache header.
 */
task('frontend:spa:build', function () {
    cd('{{release_path}}');
    run('npm ci --legacy-peer-deps', ['timeout' => 600]);
    run('npm run router:generate');
    run('npm run build', ['timeout' => 600]);
});

/**
 * Build the Next.js standalone bundle. Output is `frontend/.next/standalone/
 * server.js` plus static + public assets copied into place per Next docs.
 * Runs ONLY in the new release dir — the live `current` Next process keeps
 * serving from its old standalone tree until the symlink swap.
 */
task('frontend:next:build', function () {
    cd('{{release_path}}/frontend');
    run('npm ci', ['timeout' => 600]);
    run('npm run build', ['timeout' => 900]);
    // Per Next standalone docs: static + public aren't auto-copied.
    run('rm -rf .next/standalone/.next/static .next/standalone/public');
    run('cp -R .next/static .next/standalone/.next/static');
    run('cp -R public .next/standalone/public');
});

/**
 * Materialise prod env vars into `.env.local.php` and produce a fully
 * authoritative classmap. These run AFTER `deploy:vendors` so the
 * composer.lock dump reflects the no-dev install.
 */
task('symfony:dump_env_prod', function () {
    cd('{{release_path}}');
    run('{{bin/composer}} dump-env prod');
    run('{{bin/composer}} dump-autoload --no-dev --classmap-authoritative');
});

/**
 * PHP-FPM graceful reload. Unlike `restart`, `reload` waits for workers to
 * finish their current request before recycling them — no dropped responses.
 * Requires the deploy user to have NOPASSWD sudo on systemctl reload for
 * php8.5-fpm (see DEPLOYER-CUTOVER.md §3).
 */
task('service:php-fpm:reload', function () {
    run('sudo /bin/systemctl reload php8.5-fpm');
});

/**
 * Next.js restart. SIGINT kills the old process; systemd starts the new one
 * pointing at `current/frontend/.next/standalone`. There IS a sub-second
 * window where the Next process isn't accepting connections — see CUTOVER §5
 * for the blue-green upgrade path if/when traffic justifies it.
 *
 * Skipped gracefully if the unit isn't installed (pre-Phase-6 hosts).
 */
task('service:next:restart', function () {
    $hasUnit = run('systemctl list-unit-files dailybrew-next.service 2>/dev/null | grep -c dailybrew-next || true');
    if ((int) trim($hasUnit) > 0) {
        run('sudo /bin/systemctl restart dailybrew-next');
    } else {
        writeln('  <comment>dailybrew-next.service not installed — skipping (legacy SPA still serving)</comment>');
    }
});

// ── Recipe wiring ───────────────────────────────────────────────────────────
//
// The Symfony recipe already pulls `deploy:prepare`, `deploy:vendors`,
// `deploy:cache:clear`, `database:migrate`, `deploy:publish`, etc. We extend
// the pipeline with the SPA + Next builds and the systemd reloads.

after('deploy:vendors', 'symfony:dump_env_prod');
after('symfony:dump_env_prod', 'frontend:spa:build');
after('frontend:spa:build', 'frontend:next:build');

// Migrations run against the live DB BEFORE the symlink swap. They MUST be
// backward-compatible — the previous release is still serving traffic at this
// moment. See DEPLOYER-CUTOVER.md §6 for the safe-migration rules.
//
// `database:migrate` is provided by recipe/symfony.php. Override the default
// command so we explicitly pass --no-interaction (the recipe's default does
// this but we make it explicit).
set('bin/console', '{{bin/php}} {{release_path}}/bin/console --no-interaction');

// Symlink swap is `deploy:symlink`, contributed by the base recipe and fired
// from `deploy:publish`. Reload PHP-FPM the moment the swap completes so
// new workers pick up the new code immediately; restart Next afterwards.
after('deploy:symlink', 'service:php-fpm:reload');
after('service:php-fpm:reload', 'service:next:restart');

// Rollback flow: when `dep rollback production` runs, it points `current` at
// the previous release. We still want PHP-FPM + Next to pick up the
// directory swap, so the same reload hooks fire.
after('rollback:done', 'service:php-fpm:reload');
after('service:php-fpm:reload', 'service:next:restart');

// On any deploy failure, release the lock so the next run isn't blocked.
fail('deploy', 'deploy:unlock');
