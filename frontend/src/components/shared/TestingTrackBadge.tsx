import { cn } from "@/lib/utils";
import type { WorkspaceTestingTrack } from "@/types/admin";

const TONE: Record<WorkspaceTestingTrack, string> = {
  none: "bg-cream-3/60 text-text-tertiary",
  alpha: "bg-amber/15 text-amber",
  beta: "bg-[#3B6FA0]/15 text-blue",
};

const LABEL: Record<WorkspaceTestingTrack, string> = {
  none: "Prod",
  alpha: "Alpha",
  beta: "Beta",
};

/**
 * Compact pill showing a workspace's testing track. Rendered in the admin
 * workspaces list + detail page so super-admins can see at a glance which
 * cohort a workspace belongs to.
 */
export function TestingTrackBadge({
  track,
  className,
}: {
  track: WorkspaceTestingTrack;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        TONE[track],
        className,
      )}
    >
      {LABEL[track]}
    </span>
  );
}
