import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { TrendLateEmployee } from "@/types";

/**
 * Who arrived late most often in the window. One series, bar-at-the-tip
 * labelled — the point is the ranking, not the exact pixel length, so the bar
 * is scaled against the worst offender rather than an absolute axis.
 */
export function LateLeaderboard({
  topLate,
  isStale,
  renderName,
}: {
  topLate: TrendLateEmployee[];
  isStale?: boolean;
  /** Lets each app wrap the name in its own router link. */
  renderName?: (employee: TrendLateEmployee) => React.ReactNode;
}) {
  const { t } = useTranslation();

  if (topLate.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-[15px] text-text-tertiary">
        {t("charts.noLateArrivals", "Nobody arrived late in this range. Nice.")}
      </p>
    );
  }

  const worst = Math.max(...topLate.map((e) => e.late));

  return (
    <div className={cn("space-y-3 px-5 pb-5 pt-4 transition-opacity duration-200", isStale && "opacity-50")}>
      {topLate.map((employee) => (
        <div key={employee.employeePublicId}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-[14px] font-medium text-text-primary">
              {renderName ? renderName(employee) : employee.employeeName}
            </span>
            <span className="shrink-0 text-[12.5px] tabular-nums text-text-secondary">
              {t("charts.lateOfShifts", {
                late: employee.late,
                total: employee.present,
                defaultValue: "{{late}} of {{total}} shifts",
              })}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-cream-3/60">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.max((employee.late / worst) * 100, 4)}%`,
                backgroundColor: "var(--db-chart-late)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
