# DailyBrew frontend (Next.js)

The Next.js App Router frontend that is replacing the legacy React SPA + Symfony
Twig shell. See [`../docs/nextjs-migration-plan.md`](../docs/nextjs-migration-plan.md)
for the full migration plan, decisions, and build order.

> **Next.js 16** — Turbopack is the default for `dev` and `build`, `params`/`searchParams`
> are async, middleware is now `proxy.ts`, and `next lint` is gone (use `eslint`
> directly). When in doubt, read the bundled docs in `node_modules/next/dist/docs/`
> before writing Next-specific code (see `AGENTS.md`).

## Architecture

- **Frontend only.** The Symfony API (`/api/v1/*`), OAuth, and webhooks are unchanged.
- **Same-origin in production.** A reverse proxy routes `/api`, `/oauth`, and
  `/.well-known` to Symfony; everything else hits this Next.js Node server. This
  keeps the `BEARER` cookie (`path=/api/v1`) + refresh-token model working.
- **Node server, not static export.** Built with `output: "standalone"`.

## Local development

This app talks to a locally running Symfony API. Start Symfony first, then:

```bash
cd frontend
npm install
SYMFONY_ORIGIN=http://127.0.0.1:8000 npm run dev   # default origin if unset
```

`next.config.ts` rewrites `/api`, `/oauth`, and `/.well-known` to `SYMFONY_ORIGIN`
so requests stay same-origin (cookies behave exactly like production).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build (`standalone`) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
