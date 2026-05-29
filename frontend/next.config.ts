import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * In production the reverse proxy routes /api, /oauth, and /.well-known to
 * Symfony before they ever reach Next (see docs/nextjs-migration-plan.md).
 * These rewrites are a same-origin convenience for local dev (`npm run dev`)
 * so the Next dev server can reach a locally running Symfony — keeping the
 * BEARER cookie behaviour identical to production.
 */
const SYMFONY_ORIGIN = process.env.SYMFONY_ORIGIN ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // Node server build for deployment behind the reverse proxy (not a static export).
  output: "standalone",
  // Let .mdx files act as pages/routes (blog posts).
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Monorepo: pin the workspace root to this dir so Turbopack doesn't infer it
  // from the sibling Symfony lockfile at the repo root.
  turbopack: { root: import.meta.dirname },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${SYMFONY_ORIGIN}/api/:path*` },
      { source: "/oauth/:path*", destination: `${SYMFONY_ORIGIN}/oauth/:path*` },
      {
        source: "/.well-known/:path*",
        destination: `${SYMFONY_ORIGIN}/.well-known/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/blog/three-factor-attendance-banking-security",
        destination: "/blog/three-factor-attendance",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
