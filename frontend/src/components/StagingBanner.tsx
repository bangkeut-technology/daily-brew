"use client";

import { useEffect, useState } from "react";

/**
 * Renders a thin sticky banner across the top of every page when the
 * request is hitting the staging subdomain (`next.dailybrew.work` or
 * `staging.*`). Warns visitors that they are looking at the in-progress
 * Next.js frontend and that any account/workspace/leave actions they
 * take affect the real production database.
 *
 * Deliberately client-side: a server-side `headers()` read would force
 * every marketing page out of static generation (next build flips them
 * all to dynamic), which defeats the SSG/LCP gain that's the entire
 * point of porting marketing to Next. The brief banner-less flash on
 * staging is an acceptable trade for keeping production routes static.
 */
export function StagingBanner() {
  const [isStaging, setIsStaging] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setIsStaging(host.startsWith("next.") || host.startsWith("staging."));
  }, []);

  if (!isStaging) {
    return null;
  }

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-amber/30 bg-amber/15 px-4 py-1.5 text-center text-[12.5px] font-medium text-amber"
    >
      <span aria-hidden>⚠</span>
      <span>
        Staging mirror — actions affect production data. Production lives at{" "}
        <a
          href="https://dailybrew.work"
          className="underline decoration-amber/40 underline-offset-2 hover:decoration-amber"
        >
          dailybrew.work
        </a>
        .
      </span>
    </div>
  );
}
