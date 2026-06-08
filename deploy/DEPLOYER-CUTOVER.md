# Atomic deploys cutover (Deployer)

**Status:** draft; not executed.
**Owner:** whoever has SSH to the prod host.
**Risk:** medium — directory layout changes and a one-time nginx flip. Rollback is to revert this PR + restore the old `deploy.yaml` workflow.

This runbook walks the operator through migrating from the legacy in-place
deploy (drop a `.maintenance` flag, mutate `/var/www/dailybrew` in place,
restart PHP-FPM) to an atomic `releases/<tag>/` + symlink-swap flow driven by
[Deployer](https://deployer.org/). After the cutover, every deploy is
zero-downtime: nginx keeps serving the previous release while the new one
builds, then an atomic `ln -sfn` flip + `systemctl reload php8.5-fpm` promotes
the new code without dropping in-flight requests.

> While the new workflow `deploy-atomic.yaml` is set to `workflow_dispatch`,
> the legacy `deploy.yaml` keeps firing on every release. Nothing changes for
> users until you complete §2 + §4 below.

---

## 1. Directory layout after cutover

```
/var/www/dailybrew/
├── current   → releases/v1.103.0/      ← single atomic symlink
├── releases/
│   ├── v1.101.0/
│   ├── v1.102.0/                       ← previous, kept for rollback
│   └── v1.103.0/                       ← live
└── shared/
    ├── .env.local                      ← per-host secrets
    ├── config/jwt/
    │   ├── private.pem                 ← LexikJWT keypair
    │   └── public.pem
    ├── var/log/                        ← persistent across releases
    └── public/uploads/                 ← user-uploaded avatars
```

Each release contains a complete checkout + a built `vendor/`, `public/build/`,
and `frontend/.next/standalone/`. The release tree is read-only at runtime —
anything that needs to persist lives in `shared/` and is symlinked in.

---

## 2. Pre-flight on the prod host (one-time)

### 2.1 Move existing state into `shared/`

```bash
ssh prod
cd /var/www/dailybrew

# Stop firing the legacy deploy until cutover is done.
# (We'll re-enable atomic deploys at the end.)

# Snapshot the current tree as the first "release"
sudo mkdir -p releases shared shared/config shared/var shared/public
sudo mv .env.local                       shared/.env.local
sudo mv config/jwt/private.pem           shared/config/jwt/private.pem
sudo mv config/jwt/public.pem            shared/config/jwt/public.pem
sudo mv var/log                          shared/var/log
sudo mv public/uploads                   shared/public/uploads || true

# Stash the current working tree as releases/pre-cutover/ so we have a
# rollback target before the first Deployer run.
sudo mv * .[^.]* releases/pre-cutover/ 2>/dev/null || true
# (re-create the top-level dirs that need to exist as siblings)
sudo mkdir -p releases shared
sudo mv releases/pre-cutover/releases/* releases/ 2>/dev/null || true
sudo mv releases/pre-cutover/shared/*   shared/   2>/dev/null || true

sudo ln -s releases/pre-cutover current
ls -la
# Expected: current symlink, releases/pre-cutover/, shared/
```

> If anything in this step looks off, `mv releases/pre-cutover/* .` puts the
> tree back exactly as it was. Do that FIRST before debugging.

### 2.2 Fix ownership

```bash
sudo chown -R www-data:www-data /var/www/dailybrew
# Deployer needs SSH login for the deploy user — typically NOT www-data.
# Adjust to match whatever user appsleboy/ssh-action was logging in as.
sudo chown -R "$DEPLOY_USER":www-data /var/www/dailybrew
sudo chmod -R g+w /var/www/dailybrew/shared
```

---

## 3. Sudoers for graceful reload (one-time)

PHP-FPM `reload` (vs `restart`) is what makes this zero-downtime — it lets
workers finish their current request before recycling. The deploy user needs
NOPASSWD sudo on this specific command.

```bash
sudo visudo -f /etc/sudoers.d/dailybrew-deploy
```

Add:

```
deploy ALL=(root) NOPASSWD: /bin/systemctl reload php8.5-fpm, /bin/systemctl restart dailybrew-next
```

Replace `deploy` with whatever user the GitHub Actions ssh key authenticates as.

---

## 4. Flip nginx to `current/public`

Edit `/etc/nginx/sites-available/dailybrew.conf`:

```diff
- root  /var/www/dailybrew/public;
+ root  /var/www/dailybrew/current/public;
```

Also drop the maintenance trap — it's no longer needed:

```diff
-     if (-f $document_root/.maintenance) {
-         return 503;
-     }
-     error_page 503 @maintenance;
-     location @maintenance {
-         rewrite ^(.*)$ /maintenance.html break;
-     }
```

Then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

> If the legacy `deploy.yaml` fires again at this point (because release-please
> published a tag), it will still mutate `/var/www/dailybrew/current/public`
> in place — which is fine, since `current/public` is real bytes through the
> symlink. The legacy flow keeps working during the bake.

---

## 5. Flip systemd unit for Next.js

`dailybrew-next.service` was pinned to a specific release path:

```diff
- WorkingDirectory=/var/www/dailybrew/frontend/.next/standalone
+ WorkingDirectory=/var/www/dailybrew/current/frontend/.next/standalone
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl restart dailybrew-next
systemctl status dailybrew-next
```

---

## 6. Migration safety (read before every release)

The symlink swap is instant, but the database is shared between the old and
new release for the entire build window — and PHP-FPM workers don't recycle
until the swap completes. So:

**Rules**

1. Migrations are **additive only** in the same release as the code that uses them. Adding columns ✓, adding tables ✓, adding nullable indexes ✓.
2. Destructive changes split across two releases:
   - Release N: add new column, dual-write.
   - Release N+1: stop reading old column.
   - Release N+2: drop old column.
3. Indexes that take seconds: fine. Indexes that take minutes: ship the migration in a separate dedicated release window with an off-hours deploy.
4. Renames are always 3-step (add new, dual-write, switch reads, switch writes, drop old).

**Example**: PR #265 (Employee.linked_at) was a pure `ADD COLUMN` — atomic-deploy-safe. The future "drop Employee.created_at" would need to wait at least one release after no code references it.

---

## 7. First deploy via Deployer

After §2–§5 above are done on the host:

```bash
# Locally OR from CI (whichever you trust first):
composer install
DEPLOY_TAG=$(git describe --tags --abbrev=0) \
DEPLOY_HOST=prod.dailybrew.work \
DEPLOY_USER=deploy \
DEPLOY_PORT=22 \
DEPLOY_PATH=/var/www/dailybrew \
  vendor/bin/dep deploy production -vv
```

Watch the output. Key milestones:

- `[OK] deploy:vendors` — composer install --no-dev finished
- `[OK] symfony:dump_env_prod` — `.env.local.php` materialized in the new release
- `[OK] frontend:spa:build` — Encore bundle built into `releases/<tag>/public/build/`
- `[OK] frontend:next:build` — Next standalone built
- `[OK] database:migrate` — migrations applied to the live DB
- `[OK] deploy:symlink` — **the atomic swap; new code goes live here**
- `[OK] service:php-fpm:reload` — workers recycled gracefully
- `[OK] service:next:restart` — Next process restarted

If anything before `deploy:symlink` fails, the new release is just an unused
directory — production keeps serving from the old `current` target. Cleanup:
`rm -rf releases/<failed-tag>` on the host.

### Rollback

If a deploy goes live and something is broken:

```bash
DEPLOY_HOST=... DEPLOY_USER=... DEPLOY_PORT=22 DEPLOY_PATH=/var/www/dailybrew \
  vendor/bin/dep rollback production
```

This re-points `current` at the previous release and reloads PHP-FPM. Sub-second.

> Rollback DOES NOT reverse database migrations. If a migration is the
> problem, you need a forward-fix migration in a new release.

---

## 8. Enable the atomic workflow + disable the legacy one

Once §7 succeeds twice in a row from manual `workflow_dispatch`:

1. In `.github/workflows/deploy-atomic.yaml`, uncomment the `release.types: [published]` trigger.
2. In `.github/workflows/deploy.yaml`, comment out the same trigger (keep the file as a fallback for emergencies).
3. Push the change. The next release-please release will go through the atomic flow.

Bake for two release cycles. Then:

```bash
# On the host — confirm legacy is dormant
sudo rm /var/www/dailybrew/releases/pre-cutover/public/.maintenance || true
# (the legacy flow's maintenance trap is gone from nginx; this is just hygiene)
```

After a third successful release through Deployer, delete `deploy.yaml`.

---

## 9. Known limitations

- **Next.js restart is not graceful.** Sub-second window where the Next process isn't listening on `127.0.0.1:3000`. nginx returns 502 for that window. Since nginx routes API + OAuth + .well-known to PHP-FPM directly, only the SPA shell + Next-rendered pages hit this — and the user typically retries within the click. For true zero-downtime on Next, the next step is blue-green with two units (`dailybrew-next-blue` + `dailybrew-next-green`) behind an nginx upstream that fails over. Out of scope for this cutover.
- **Long-running migrations** still block the deploy completion message — the symlink swap waits for `database:migrate` to finish. This is intentional (we don't want the new release to go live with the DB still mid-migration), but means slow migrations = slow deploys. Plan them off-hours and run them in a dedicated maintenance release.
- **Shared dirs grow over time.** `releases/` accumulates — Deployer's `deploy:cleanup` keeps the most recent 5 (configurable via `keep_releases` in `deploy.php`). Older ones are deleted automatically.

---

## 10. References

- Deployer docs: <https://deployer.org/docs/7.x>
- Symfony recipe: <https://deployer.org/docs/7.x/recipe/symfony>
- Atomic deploy concept: <https://capistranorb.com/documentation/getting-started/structure/>
