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
├── current   → releases/3/              ← single atomic symlink
├── releases/
│   ├── 1/                               ← `pre-cutover` after §2.1
│   ├── 2/                               ← previous, kept for rollback
│   └── 3/                               ← live
└── shared/
    ├── .env.local                       ← per-host secrets
    ├── config/jwt/
    │   ├── private.pem                  ← LexikJWT keypair
    │   └── public.pem
    ├── var/log/                         ← persistent across releases
    └── public/uploads/                  ← user-uploaded avatars
```

Each release contains a complete checkout + a built `vendor/`, `public/build/`,
and `frontend/.next/standalone/`. The release tree is read-only at runtime —
anything that needs to persist lives in `shared/` and is symlinked in.

> **Naming gotcha:** Deployer's `release_name` is a **monotonic integer**
> (1, 2, 3, …), tracked in `.dep/releases_log`. NOT the git tag. We seed the
> sequence by renaming the pre-cutover snapshot to `releases/1/` below; the
> first `dep deploy` run after that lands in `releases/2/`.

---

## 2. Pre-flight on the prod host (one-time)

### 2.0 SSH key for CI (one-time, BEFORE any of the host migration below)

The new workflow `deploy-atomic.yaml` authenticates with a private key — the
legacy `deploy.yaml` used password auth via `secrets.PASSWORD`. Both can
coexist during the bake; you do this once.

On the prod host, as the deploy user:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/dailybrew-ci -N ""
cat ~/.ssh/dailybrew-ci.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/dailybrew-ci
# ↑ COPY THIS PRIVATE-KEY OUTPUT
```

In GitHub: **Settings → Secrets and variables → Actions → New repository
secret**:

- Name: `DEPLOY_SSH_KEY`
- Value: paste the private key (including the `-----BEGIN/END-----` lines)

Smoke test locally:

```bash
ssh -i ~/.ssh/dailybrew-ci -p $PORT $DEPLOY_USER@$HOST 'echo ok'
```

### 2.1 Move existing state into `shared/`

```bash
ssh prod
sudo bash    # the rest of this section runs as root for fewer sudo prefixes
cd /var/www/dailybrew

# 1. shared dirs + per-host secrets
mkdir -p releases shared shared/config/jwt shared/var shared/public
mv .env.local                       shared/.env.local
mv config/jwt/private.pem           shared/config/jwt/private.pem
mv config/jwt/public.pem            shared/config/jwt/public.pem
mv var/log                          shared/var/log
mv public/uploads                   shared/public/uploads || true

# 2. Snapshot the current tree as releases/1/ (Deployer's release_name is
#    a monotonic integer — seeding it with 1 keeps the count consistent).
#    Use `find` with an explicit deny-list instead of mv `*` — globs don't
#    catch dotfiles + we'd accidentally recurse into the just-created dirs.
mkdir -p releases/1
shopt -s dotglob
find . -maxdepth 1 -mindepth 1 \
    ! -name releases ! -name shared ! -name current \
    -exec mv -t releases/1/ {} +
shopt -u dotglob

# 3. Bridge the pre-cutover release back to shared/ so nginx + the Next
#    process can serve uploads + write logs DURING the gap between this
#    cutover and the first successful `dep deploy` (avatars would 404
#    otherwise — public/uploads is the only directory consumed by URL).
ln -s ../../shared/.env.local                     releases/1/.env.local
ln -s ../../../shared/config/jwt/private.pem      releases/1/config/jwt/private.pem
ln -s ../../../shared/config/jwt/public.pem       releases/1/config/jwt/public.pem
ln -s ../../shared/var/log                        releases/1/var/log
ln -s ../../shared/public/uploads                 releases/1/public/uploads

# 4. Atomic current → 1
ln -s releases/1 current
ls -la
# Expected: `current` symlink → releases/1, `releases/1/` populated, `shared/` populated.
exit   # leave the root subshell
```

> **Rollback this step:** `sudo bash -c 'rm current; mv releases/1/* releases/1/.[!.]* .; rmdir releases/1'`
> puts the tree back. Do that FIRST before debugging if §2.1 looked off.

### 2.2 Fix ownership

Set `$DEPLOY_USER` to the SSH user that authenticates with the key from §2.0
(commonly `deploy` or `www-data` — whichever logs in via `webfactory/ssh-agent`).

```bash
export DEPLOY_USER=deploy   # ← set this first, BEFORE running the chown
sudo chown -R www-data:www-data /var/www/dailybrew
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

Add (replace `deploy` with whatever user the GitHub Actions SSH key authenticates as — see §2.0):

```
# Non-tty sudo is required because the deploy fires over SSH without a PTY.
# RHEL-family hosts default to `Defaults requiretty` which BLOCKS NOPASSWD
# sudo over SSH — override it for the deploy user only.
Defaults:deploy !requiretty

deploy ALL=(root) NOPASSWD: /bin/systemctl reload php8.5-fpm, /bin/systemctl restart dailybrew-next
```

Smoke-test from your local shell (NOT the host shell — must go over SSH so
the requiretty path is exercised):

```bash
ssh -i ~/.ssh/dailybrew-ci $DEPLOY_USER@$HOST 'sudo -n /bin/systemctl reload php8.5-fpm && echo ok'
# Expected: "ok". If you see "sudo: a password is required" the requiretty
# line is missing or the user/path doesn't match.
```

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
- `[OK] frontend:spa:build` — Encore bundle built into `releases/<n>/public/build/`
- `[OK] frontend:next:build` — Next standalone built
- `[OK] database:migrate` — migrations applied to the live DB (BEFORE the symlink swap so we abort if migrations fail)
- `[OK] deploy:symlink` — **the atomic swap; new code goes live here**
- `[OK] service:php-fpm:reload` — workers recycled gracefully
- `[OK] service:next:restart` — Next process restarted; readiness probe waits for `http://127.0.0.1:3000/` to return 200

If anything before `deploy:symlink` fails, the new release is just an unused
directory — production keeps serving from the old `current` target. Cleanup:
`sudo rm -rf releases/<failed-N>` on the host (find the highest integer
under `releases/` that isn't pointed at by `current`).

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
2. In `.github/workflows/deploy.yaml`, **comment out** the `release.types: [published]` trigger
   (keep the file checked in — easy `git revert` if you need to roll back to in-place
   deploys mid-bake).
3. Push the change. The next release-please release will go through the atomic flow.

Bake for two release cycles. Then:

```bash
# On the host — confirm legacy is dormant
sudo rm /var/www/dailybrew/releases/1/public/.maintenance || true
# (the legacy flow's maintenance trap is gone from nginx; this is just hygiene)
```

After a third successful release through Deployer (and you've verified no
caller still hits `deploy.yaml`), delete it in a separate PR.

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
