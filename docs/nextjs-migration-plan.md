# Next.js migration plan — DailyBrew frontend

**Status:** draft for review · **Scope:** frontend only · **Owner:** TBD

## 1. Goal & scope

Replace the React SPA (TanStack Router) + Symfony Twig shell (`SpaController` / `base.html.twig`) with a **Next.js App Router** application. The **Symfony API stays exactly as-is** — `/api/v1/{_locale}/*`, OAuth controllers, Paddle/Telegram/BasilBook webhooks, JWT/refresh firewalls, DB, all business logic. This is a **frontend-only** migration; we are not porting PHP.

**In scope:** all non-API routes — marketing/legal pages, `/sign-in`, `/sign-up`, `/auth/callback`, `/onboarding`, `/forgot-password`, `/reset-password`, `/checkin/:qrToken`, `/console/*`, `/admin/*`.

**Out of scope:** Symfony API, database, the iOS refresh-token firewall split, payment/webhook logic, the mobile Expo app.

**Why we're doing it (honest framing):** the team wants the whole frontend on Next.js for long-term direction (DX, hiring, RSC). The pure-SEO gain is narrow — PR #148 already server-renders per-page meta/canonical and 404s unknown paths; the only remaining SEO upside is body-level SSR/SSG of the ~23 marketing pages (better LCP, better non-Google/AI crawlers) plus optional localized URLs with hreflang. Rankings ultimately move on content + links, which this migration does not provide.

## 2. Target topology (the critical decision)

Today the SPA is served **same-origin** with the API, and auth relies on it: the JWT lives in a `BEARER` cookie scoped to `path=/api/v1`, with a single-use refresh-token cookie and a dedicated `token_refresh` firewall (see CLAUDE.md — the iOS cookie-path quirk). **This only works if the browser sends those cookies to `/api/v1` as same-origin requests.**

**Recommendation: keep Next.js same-origin with the Symfony API behind one reverse proxy.**

```
                    ┌────────────────────────────┐
  dailybrew.work →  │  reverse proxy (nginx)      │
                    │   /api/*      → Symfony (PHP-FPM)
                    │   /oauth/*    → Symfony
                    │   /.well-known/* → Symfony
                    │   everything else → Next.js (Node)
                    └────────────────────────────┘
```

- Cookies, JWT, refresh, OAuth redirects, and the iOS quirk all keep working unchanged because the origin is unchanged.
- **Rejected alternative:** Next on Vercel + API on a separate origin. That forces cross-site cookies (`SameSite=None`, CORS preflight, cookie-domain juggling) and would re-open the exact silent-logout class of bug we already fixed. Only worth it if we move auth to a fundamentally different model — not recommended now.

**Open infra question:** there are no Docker/nginx/deploy files in the repo, so current hosting is server-side config. We need to confirm where Symfony runs today and add a Node process + proxy rule there (or containerize). This is a prerequisite for Phase 0.

## 3. Key technology decisions (recommended)

| Decision | Recommendation | Notes |
|---|---|---|
| Router | **App Router (RSC)** | SSG/SSR/streaming for marketing; private pages stay client-rendered |
| i18n | **next-intl** with `[locale]` segments | Today i18next is client-only, sessionStorage-based, no localized URLs. Opportunity: `/`, `/fr/`, `/km/` with hreflang for SEO. Reuse existing `locales/{en,fr,km}/common.json` |
| Data fetching | **Keep TanStack Query** for client/private pages; RSC fetch for public | Axios client + interceptors port over largely intact |
| Auth | **Keep current cookie/JWT model**, client-side | Private pages are `noindex`, so no need to SSR them with user data. Avoids touching the refresh firewall |
| UI | shadcn/Radix + Tailwind v4 port directly | Mark interactive shared components `'use client'` (GlassCard, Custom*, Toggle, modals) |
| Forms | Zod + RHF unchanged | Client components |
| Config injection | `window.__DAILYBREW__` (Twig) → `NEXT_PUBLIC_*` env + server config | Paddle ids, GA id, client ids, telegram username |
| Scripts | GA + Paddle.js via `next/script` | Move out of `base.html.twig` |
| PWA / service worker | Port `sw.js` via `next-pwa` or custom | Re-validate offline/check-in caching |
| Rendering / output | **Node server** (`next build` + `next start`), SSG/`force-static` for marketing, client/dynamic for app | **Not** `output: 'export'` — pure static can't serve `/console/*`, `/checkin/[qrToken]`, or i18n middleware |
| Build/deploy | Encore → `next build`; add Node deploy step behind the proxy | release-please flow + version bump CI stays |
| Testing | Keep PHP unit-only; add light Playwright smoke for auth + check-in | Per repo norm: unit-first |

## 4. Migration strategy: big-bang cutover (decided)

> **Decided 2026-05-27:** same-origin reverse proxy · monorepo (`frontend/`) · **big-bang** cutover · Next runs as a **Node server** (`next build` + `next start`), SSG where possible — **not** `output: 'export'`.

We rebuild the **entire** frontend on Next.js on a branch + staging, QA it as a whole, then flip the proxy from the Symfony SPA to Next in a **single cutover**. The legacy SPA/Twig stays deployable as the rollback target through a bake period.

The phases below are therefore a **build order**, not independent production ships — only the final cutover (Phase 6) changes what production serves.

**Mandatory because it's big-bang:**
- **Staging that mirrors prod** — same-origin proxy, real cookie/OAuth flow, tested on real iOS Safari. Auth cannot be validated any other way.
- **Frontend feature freeze (or double-implement policy)** for the rewrite window (~7–10 wks). Any frontend change shipped to the live SPA during the freeze must also be ported to the Next branch, or it's lost at cutover. **This is the biggest practical cost of big-bang** — agree the freeze policy before Phase 0.
- **Single rollback lever:** the proxy flips non-API traffic back to Symfony `SpaController`. Keep the SPA build deployable until Next has baked in prod.

## 5. Build order (one production cutover at the end)

Phases 0–5 are built on the `frontend/` branch and validated on **staging**; production keeps serving the legacy SPA until the Phase 6 cutover.

### Phase 0 — Scaffold, monorepo & staging proxy (prerequisite)
- New Next.js App Router project at **`frontend/`** in this repo (monorepo).
- Port Tailwind v4 config, design tokens (coffee/cream palette, glass styles), fonts, `cn()`/utils.
- Stand up the **staging** reverse proxy with `/api`,`/oauth`,`/.well-known` → Symfony; everything else → Next Node server (`next start`).
- CI: build Next, deploy the Node process to staging. Smoke: a Next route served same-origin, API call succeeds with the `BEARER` cookie.
- **Gate:** trivial Next page on staging, auth cookie round-trips to Symfony.

### Phase 1 — Marketing & legal pages (the SEO payoff)
- Port the ~23 public pages to RSC/SSG: `/`, `/features` (+4), `/how-it-works`, `/pricing`, `/demo`, `/roles`, `/guides` (+4), `/faq`, `/support`, `/privacy`, `/terms`, `/refund`, `/delete-account`, plus `/sign-in`,`/sign-up` (client islands).
- Replace `PageSeo`/`SeoMetaResolver`+Twig with Next `generateMetadata` per route (carry over the exact titles/descriptions/canonicals we already curated).
- Move `sitemap.xml` → `app/sitemap.ts`, `robots.txt` → `app/robots.ts`.
- **Optional SEO upgrade:** localized routes (`/fr/...`, `/km/...`) + `hreflang`.
- **Gate (staging):** marketing pages body-rendered HTML, Lighthouse SEO/LCP green, no canonical/meta regressions vs PR #148.

#### Phase 1 expanded by the SEO strategy (`docs/seo-strategy.md`)
The marketing surface grows well beyond the current ~23 pages. The engineering job is to make these **cheap to add** (data/MDX-driven), not to hand-write copy. Build order follows the strategy's P0→P3 / Day-30→90 roadmap:
- **SEO foundation (engineering):** per-page `generateMetadata` helper, `sitemap.ts` (+ partitioned later), `robots.ts`, reusable **JSON-LD schema** (`SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`, `Article`), `hreflang`. _(done — this batch)_
- **MDX blog** at `/blog` + `/blog/<slug>` (12 anchor posts, strategy §6). _(infra + 1st post done — this batch)_
- **Programmatic, data-driven page templates:** industry (`/cafes`, `/restaurants`, …), competitor (`/vs-jibble`, …), country leave-laws + calculators (`/tools/annual-leave-calculator/<country>`), glossary. One data entry = one page.
- **Free-tool calculators** (interactive client components): annual-leave, shift-schedule generator, time-card, buddy-punching cost.
- **Narrative anchors:** `/three-factor-attendance`, `/stop-buddy-punching`, `/tap-to-clock-in` (NFC waitlist), `/ip-verification`.
- **`noindex` separation:** marketing indexable; `/console`,`/admin`,`/checkin`,`/auth` `noindex` (already enforced via robots + per-route metadata).
- Copy/keywords/positioning are owned by `docs/seo-strategy.md` — treat its §5, §6, §10, §12 as the content backlog.

### Phase 2 — Auth & entry flows
- `/auth/callback`, `/onboarding`, `/forgot-password`, `/reset-password`.
- Port the Axios client, auth provider, token refresh handling, `currentWorkspace` + device-id localStorage logic, role-context bootstrap.
- **Highest-risk phase** — validate Google/Apple OAuth round-trips and refresh-token rotation end to end (incl. the iOS path quirk) before cutover.

### Phase 3 — Console (`/console/*`)
- Dashboard, employees, shifts, closures, leave, attendance, qr-codes, settings, profile.
- All client components + TanStack Query. Port the permission-gated nav + route guards (`PERMISSION_GATED_ROUTES`).
- Largest volume of screens; sub-split per feature area into separate PRs.

### Phase 4 — Admin (`/admin/*`)
- Dashboard, workspaces, users, subscriptions, audit-log, cron, feature-flags, mobile-app-config. `ROLE_SUPER_ADMIN` gated.

### Phase 5 — Check-in & PWA
- `/checkin/:qrToken` (geolocation, device id, IP/geofence flows — keep client-rendered, mobile-web).
- Port service worker / manifest; re-validate PWA + offline behavior.

### Phase 6 — Production cutover & decommission
- **Cutover:** flip the prod proxy so all non-API traffic → Next. Single change; rollback = flip back to Symfony `SpaController`.
- **Bake period:** keep the legacy SPA build deployable for ~1–2 weeks; watch auth (esp. iOS refresh), error rates, Search Console.
- **Decommission (after bake):** delete `SpaController`, `templates/page` + SEO Twig, Encore config, `react-helmet-async`, TanStack Router, `routeTree.gen`, and the now-superseded `SeoMetaResolver`.

**Phase 6 prep (2026-05-28):** infra files and the operator runbook are checked
into the repo but **not applied to prod**. Cutover is a single nginx swap done
on the host by the operator when ready — see [`deploy/CUTOVER.md`](../deploy/CUTOVER.md).

What's in the repo now:
- `deploy/systemd/dailybrew-next.service.example` — Node + standalone server, env vars, hardening flags
- `deploy/nginx/dailybrew.conf.example` — `/api`+`/oauth`+`/.well-known` → PHP-FPM, everything else → `127.0.0.1:3000` (Next), maintenance-mode short-circuit included
- `deploy/CUTOVER.md` — pre-flight, cutover, rollback, bake monitoring, decommission checklist

What's still on the operator to do:
1. Copy `dailybrew-next.service.example` into `/etc/systemd/system/` and edit env vars
2. Reload + start the Next service (it's a dark canary until the proxy flips)
3. Swap the nginx site config and `systemctl reload nginx` — that's the cutover

`deploy.yaml` already builds Next on every release and gracefully no-ops the
`systemctl restart dailybrew-next` when the unit isn't installed yet.

## 6. Cross-cutting risks & landmines

- **Auth cookies (critical):** preserve same-origin or auth breaks. The `BEARER` cookie `path=/api/v1` + refresh firewall + iOS quirk must keep functioning. Test on real iOS Safari each auth-touching phase.
- **OAuth redirect URIs:** Google/Apple consoles point at Symfony `/oauth/*`; Symfony redirects back to a frontend route. Keep those intact; only the landing route owner changes (Twig → Next).
- **i18n URL change:** if we adopt `[locale]` URLs, set up `hreflang` + 301s and avoid duplicate-content; if not, keep parity with today's non-prefixed URLs.
- **SEO during transition:** never have both old SPA and new Next serving the same indexable URL. Flip per-path in the proxy atomically; keep canonicals stable.
- **Feature-freeze window (big-bang):** the live SPA and the Next rewrite diverge for ~7–10 wks. Freeze frontend feature work, or every change shipped to the SPA must be re-ported to Next before cutover. Settle this policy before Phase 0.
- **Design-system drift:** port shared components once into a single Next location; don't fork.
- **CI/CD:** new Node build + deploy artifact; release-please/version-bump must still run.

## 7. Effort (rough, frontend-only)

| Phase | Rough effort |
|---|---|
| 0 Scaffold + proxy | 0.5–1 wk |
| 1 Marketing (SEO win) | 1–1.5 wk |
| 2 Auth flows | 1–1.5 wk (risk buffer) |
| 3 Console | 2–3 wk |
| 4 Admin | 1–1.5 wk |
| 5 Check-in + PWA | 0.5–1 wk |
| 6 Cutover | 0.5 wk |
| **Total** | **~7–10 engineering weeks** |

Phase 1 delivers the entire SEO benefit on its own. Phases 3–4 are pure DX/architecture investment with no SEO upside.

## 8. Decisions

**Resolved (2026-05-27):**
1. **Topology:** ✅ same-origin reverse proxy.
2. **Sequencing:** ✅ big-bang cutover.
3. **Repo layout:** ✅ monorepo `frontend/`.
4. **Rendering:** ✅ Node server (`next start`), SSG where possible — not `output: 'export'`.

**Still open before Phase 0:**
5. **Feature-freeze policy** for the rewrite window (freeze vs double-implement).
6. **i18n URLs:** adopt localized `/fr`,`/km` + hreflang now, or keep current non-prefixed routes.
7. **Hosting:** where the Node process runs (same box as Symfony / container / managed) and how the prod proxy is configured (no infra files in repo today).
8. **Tooling:** package manager (npm, per current lockfile?) and Next version (latest stable).
