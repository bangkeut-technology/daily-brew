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

// HTTPS with the runner-injected GITHUB_TOKEN — prod has no SSH key for
// GitHub, so a `git@github.com:` URL fails at `deploy:update_code` with
// exit 128. The token is short-lived (workflow run lifetime), scoped to
// this repo's contents:read, and persists only inside `releases/N/.git/`
// until Deployer's cleanup removes the release. Mirrors what the legacy
// deploy.yaml does with `git fetch https://user:token@github.com/...`.
set('repository', static fn () => sprintf(
    'https://x-access-token:%s@github.com/bangkeut-technology/daily-brew.git',
    getenv('GITHUB_TOKEN') ?: '',
));

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
// tree. `var/log` and `public/uploads` are SYMLINKS to shared/ after
// `deploy:shared` runs, and shared/* is already mode 0775 + debian:www-data
// — `deploy:writable` would try (and fail) to chmod through the symlinks.
// Only `var/cache` is per-release and needs writability set on each deploy.
set('writable_dirs', ['var/cache']);

// Default writable_mode is `acl` (setfacl) which isn't always installed.
// Plain chmod with group-write is enough: PHP-FPM runs as www-data which is
// already the group on releases.
set('writable_mode', 'chmod');
set('writable_chmod_mode', '0775');
set('writable_use_sudo', false);
set('writable_recursive', true);

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
    // Per Next standalone docs: static + public aren't auto-copied. Fail
    // loudly if `next build` silently skipped standalone emission (e.g. OOM
    // on the host) — otherwise the cp would 1) silently fail and 2) the
    // dailybrew-next restart would crash-loop on a non-existent server.js.
    run('test -d .next/standalone');
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
 * `cache:clear` runs as the deploy user (debian), so the cache subdirs
 * Symfony creates (var/cache/prod/vich_uploader, etc.) are owned
 * debian:debian — PHP-FPM (www-data) can't write into them at runtime.
 * Re-set group ownership + group-write so the live web user can use the
 * cache that was warmed at deploy time.
 */
task('deploy:cache:fix_perms', function () {
    cd('{{release_path}}');
    run('chgrp -R www-data var/cache');
    run('chmod -R g+rwX var/cache');
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
    // Mirror the legacy deploy.yaml's gating shape (line 63 of deploy.yaml):
    // systemctl exit status, NOT stdout count — so a degraded systemctl that
    // errors to stderr can't silently make us skip the restart.
    $installed = run('systemctl list-unit-files dailybrew-next.service >/dev/null 2>&1 && echo yes || echo no');
    if (trim($installed) === 'yes') {
        run('sudo /bin/systemctl restart dailybrew-next');
        // Wait for Next to come back up — otherwise nginx returns 502
        // indefinitely and the workflow reports success. 5s budget.
        run('for i in 1 2 3 4 5; do curl -fs -o /dev/null http://127.0.0.1:3000/ && exit 0; sleep 1; done; exit 1');
    } else {
        writeln('  <comment>dailybrew-next.service not installed — skipping (legacy SPA still serving)</comment>');
    }
});

// ── Recipe wiring ───────────────────────────────────────────────────────────
//
// recipe/symfony.php's default `deploy` chain is:
//   deploy:prepare → deploy:vendors → deploy:cache:clear → deploy:publish
// `database:migrate` is DEFINED by the recipe but NOT in that chain — we wire
// it ourselves below. Same for our SPA + Next builds and the systemd reloads.

after('deploy:vendors', 'symfony:dump_env_prod');
after('symfony:dump_env_prod', 'frontend:spa:build');
after('frontend:spa:build', 'frontend:next:build');

// Migrations run against the live DB BEFORE the symlink swap. They MUST be
// backward-compatible — the previous release is still serving traffic at this
// moment. See DEPLOYER-CUTOVER.md §6 for the safe-migration rules.
//
// Do NOT override `bin/console` to bake --no-interaction; the recipe already
// appends it via {{console_options}} and prepending the flag emits it BEFORE
// the command name on some Symfony Console versions, which errors out.
before('deploy:symlink', 'database:migrate');

// cache:clear runs as the deploy user — fix the cache group + perms so
// PHP-FPM (www-data) can write at runtime. Runs after cache:clear but
// before the symlink swap so the live release has correct perms from
// the moment it goes live.
after('deploy:cache:clear', 'deploy:cache:fix_perms');

// Symlink swap is `deploy:symlink`, contributed by the base recipe and fired
// from `deploy:publish`. Reload PHP-FPM the moment the swap completes so
// new workers pick up the new code immediately; restart Next afterwards.
after('deploy:symlink', 'service:php-fpm:reload');
after('service:php-fpm:reload', 'service:next:restart');

// Rollback flow: when `dep rollback production` runs, it points `current` at
// the previous release. We still want PHP-FPM + Next to pick up the
// directory swap, so the same reload hooks fire after `rollback`. (The task
// name is `rollback`, NOT `rollback:done` — Deployer 7 doesn't expose the
// latter; the first deploy crashed with `Task rollback:done not found`.)
after('rollback', 'service:php-fpm:reload');
after('rollback', 'service:next:restart');

// On any deploy failure, release the lock so the next run isn't blocked.
fail('deploy', 'deploy:unlock');
