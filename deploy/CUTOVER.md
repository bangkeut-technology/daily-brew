# Phase 6 cutover runbook

**Status:** prep complete; not executed.
**Owner:** whoever has SSH to the prod host.
**Risk:** single nginx config change; rollback is a `cp` + `nginx -s reload`.

This runbook walks the operator through flipping production from the legacy
Symfony+TanStack-Router SPA to the Next.js frontend that
`.github/workflows/deploy.yaml` has been quietly building since 1.75.3 alongside
the SPA.

> Until the nginx file is swapped, `dailybrew.work` keeps serving the legacy
> SPA. The Next process can be installed and running for hours/days first as a
> dark canary on `127.0.0.1:3000` without affecting users.

---

## 0. Staging subdomain — recommended before §1

Rather than the internal-only dark canary on `127.0.0.1:3000`, stand up
`next.dailybrew.work` as a **real public mirror** of prod that shares the
production database and Symfony API. The legacy SPA on `dailybrew.work`
stays untouched. You QA the entire Next surface on the subdomain for as
long as you like, then run §1–§2 against `dailybrew.work` with confidence.

The Next surface on the subdomain includes the **in-progress Next
console** (currently ~13% of SPA parity). The basic-auth gate in step 0.5
keeps non-team visitors out while you bring console parity up to scratch.

### 0.1 DNS + TLS (one-time, ~15 min)

```bash
# In your DNS provider, add:
#   next.dailybrew.work  A    <prod host IPv4>
#   next.dailybrew.work  AAAA <prod host IPv6>   # optional

ssh prod
sudo certbot --nginx -d next.dailybrew.work --expand
# Certbot writes the certificate paths into the new server block we add in 0.4.
```

### 0.2 systemd unit (one-time, ~10 min)

Exactly the same steps as §1.2 below — the same `dailybrew-next.service`
serves both `dailybrew.work` (post-cutover) and `next.dailybrew.work`. Do
that step now and the unit is ready for both.

### 0.3 OAuth providers — whitelist the subdomain (one-time, ~5 min each)

Without this, sign-in via Google or Apple on the subdomain fails with
`redirect_uri_mismatch`.

```bash
# Confirm the exact callback paths Symfony exposes:
php bin/console debug:router | grep oauth
```

Then in each provider's console, add the staging redirect URI alongside
the production one:

- Google Cloud Console → OAuth client → Authorized redirect URIs:
  `https://next.dailybrew.work/oauth/google/callback`
- Apple Developer → Services ID → Return URLs:
  `https://next.dailybrew.work/oauth/apple/callback`

### 0.4 nginx site (~20 min)

```bash
sudo cp /var/www/dailybrew/deploy/nginx/dailybrew-next.conf.example \
        /etc/nginx/sites-available/dailybrew-next.conf
sudo $EDITOR /etc/nginx/sites-available/dailybrew-next.conf
# Uncomment the `listen 443 ssl http2;`, `server_name`, `ssl_*`, and
# `*_log` lines (certbot may have written them in a separate snippet).
# Drop the duplicate `upstream` blocks at the top if dailybrew.conf
# already defines them (nginx refuses "duplicate upstream").

sudo ln -s /etc/nginx/sites-available/dailybrew-next.conf \
           /etc/nginx/sites-enabled/dailybrew-next.conf
sudo nginx -t && sudo systemctl reload nginx
```

### 0.5 Optional but recommended: basic auth gate

While the Next console is still incomplete, keep the subdomain visible
only to people you give the password to.

```bash
sudo htpasswd -c /etc/nginx/.htpasswd-next dailybrew
# (you'll be prompted for the password)
sudo $EDITOR /etc/nginx/sites-available/dailybrew-next.conf
# Uncomment the auth_basic + auth_basic_user_file lines
sudo nginx -t && sudo systemctl reload nginx
```

### 0.6 First smoke test

```bash
curl -sI https://next.dailybrew.work/ | head -5
# Expect: HTTP/2 200 (or 401 if basic-auth enabled),
#         X-Robots-Tag: noindex, nofollow,
#         and either x-powered-by: Next.js (if visible) or the response served by Next

curl -s https://next.dailybrew.work/robots.txt
# Expect: User-agent: *
#         Disallow: /
```

Then in a real browser (incognito): visit `https://next.dailybrew.work`,
confirm the amber **"Staging mirror — actions affect production data"**
banner is at the top, browse marketing pages, sign in via email/password,
confirm OAuth round-trips, confirm dashboard loads. **Test on real iOS
Safari** — that's where the 1.68.1 refresh-token bug lived.

### 0.7 Use the subdomain to find gaps

While the subdomain is up, work through the SPA console feature list
against the Next console to surface parity gaps that block §1–§2. The
goal is to reach §1 with no surprises. Track gaps as PRs; merge each
into `main` to deploy them to both prod (Next artifact, not served yet)
and the staging subdomain (served immediately).

---

## 1. Pre-flight (do all of this before the actual flip)

### 1.1 Confirm the build artifact is on the host

```bash
ssh prod
ls /var/www/dailybrew/frontend/.next/standalone/server.js
# → must exist. If not, trigger a deploy first (any `fix:` or `feat:` commit
#   to main will do it via release-please → deploy.yaml).
```

### 1.2 Provision the systemd unit (one-time)

```bash
sudo cp /var/www/dailybrew/deploy/systemd/dailybrew-next.service.example \
        /etc/systemd/system/dailybrew-next.service
sudo $EDITOR /etc/systemd/system/dailybrew-next.service
```

Edit the file:

- `WorkingDirectory` — must point at the actual `.next/standalone` path on this host
- `NEXT_PUBLIC_*` — copy each value from the legacy SPA's `window.__DAILYBREW__`
  (or from `.env.local` / the deploy `secrets`). They're baked into the build, so
  setting them here matters only as the runtime fallback for server components.

Activate:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now dailybrew-next
systemctl status dailybrew-next    # should be active (running)
```

Smoke test from the host itself (still no traffic flipped):

```bash
curl -sI http://127.0.0.1:3000/ | head -1
# → HTTP/1.1 200 OK
curl -s http://127.0.0.1:3000/ | grep -c '<html'
# → 1
```

### 1.3 Save the current nginx config

```bash
sudo cp /etc/nginx/sites-available/dailybrew.conf{,.pre-cutover}
```

Keep this file. It is the rollback artifact.

### 1.4 Compose the cutover nginx config

```bash
diff /etc/nginx/sites-available/dailybrew.conf \
     /var/www/dailybrew/deploy/nginx/dailybrew.conf.example
```

Take the `server { ... }` envelope from the current file (TLS cert paths,
`server_name`, `listen 443 ssl`, log paths). Take the `upstream`, `location`,
and maintenance blocks from `deploy/nginx/dailybrew.conf.example`. Result lives
at `/etc/nginx/sites-available/dailybrew.conf`.

### 1.5 Validate

```bash
sudo nginx -t
# → syntax is ok / test is successful
```

---

## 2. Cutover

```bash
sudo systemctl reload nginx
```

That's the whole cutover. One process, no downtime — nginx reload is graceful.

### 2.1 Verify in a browser (incognito + DevTools open)

| URL | Expect |
|---|---|
| `https://dailybrew.work/` | Marketing home from Next. View Source: **no** `<script src="/build/daily_brew_application.…"`. Should see Next's `<script src="/_next/static/…"` instead. |
| `https://dailybrew.work/sign-in` | Sign-in form, Next-rendered. |
| `https://dailybrew.work/sign-up` | Sign-up form. Apple/Google buttons present. |
| `https://dailybrew.work/console/dashboard` (signed in) | Loads, shows correct workspace, no console errors. |
| `https://dailybrew.work/admin/cron` (super-admin) | Loads, command picker works. |
| `https://dailybrew.work/checkin/<some-token>` | Mobile check-in page renders. |
| `https://dailybrew.work/api/v1/users/me` (signed in) | JSON response — proves API still hits PHP-FPM. |
| `https://dailybrew.work/.well-known/apple-app-site-association` | JSON manifest from Symfony. |

### 2.2 If anything is wrong → rollback (under 30 seconds)

```bash
sudo cp /etc/nginx/sites-available/dailybrew.conf.pre-cutover \
        /etc/nginx/sites-available/dailybrew.conf
sudo nginx -t && sudo systemctl reload nginx
```

You're back on the SPA. The Next process keeps running; it just stops getting
traffic. Capture what broke (browser console, nginx error log, Sentry) before
attempting again.

---

## 3. Bake period (1–2 weeks before decommission)

Monitor:

- **Search Console** — indexing of new pages
- **Sentry / nginx error log** — 4xx / 5xx spike
- **Auth flows** — especially iOS Safari refresh-token rotation (the 1.68.1 bug)
- **Email & Telegram notifications** — confirm URLs in those notifications still
  resolve correctly through the new proxy
- **Daily-summary cron + scheduled-command runner** — still firing, still
  delivering

Both stacks remain deployable side-by-side during this window. Releases continue
to push to `main` → release-please → deploy.yaml — the SPA bundle and the Next
build are both produced on every deploy.

---

## 4. Decommission (separate PR, AFTER bake confirms stability)

Do not include this in the cutover PR. A separate PR after bake will:

- Delete `src/Controller/SpaController.php` and its routes
- Delete `templates/page/*` + the SEO Twig that `SpaController` rendered
- Remove the `react-helmet-async` + TanStack Router runtime (`assets/src/`)
- Remove Encore + the `npm run build` step from `deploy.yaml` (Symfony side)
- Delete `routeTree.gen` and `npm run router:generate`
- Remove `SeoMetaResolver` if nothing else consumes it
- Drop the `/public/build/` location block from the nginx config
- Update `CLAUDE.md`: the frontend section becomes Next-only

Keep the BasilBook integration, the JWT refresh firewall, the admin
controllers, the cron infrastructure — those are Symfony backend, untouched.

---

## 5. What this runbook deliberately does NOT do

- **It does not modify deploy.yaml to flip the proxy.** The proxy lives in
  nginx on the host. `deploy.yaml` only builds and copies artifacts.
- **It does not auto-install the systemd unit.** Per the project's deploy
  posture, host-level configuration is a one-time operator concern.
- **It does not enforce that you swap before decommissioning.** You can run
  Next in dark canary mode (steps 1.1 + 1.2) for an arbitrary period before
  doing step 2.
