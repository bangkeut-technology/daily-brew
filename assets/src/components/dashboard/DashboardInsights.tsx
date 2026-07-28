import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Skeleton } from '@/components/admin/AdminDataStates';
import { AttendanceTrendChart } from '@/components/charts/AttendanceTrendChart';
import { LateLeaderboard } from '@/components/charts/LateLeaderboard';
import { RangeToggle } from '@/components/charts/RangeToggle';
import { TrendStatCard } from '@/components/charts/TrendStatCard';
import { WeekdayPunctualityChart } from '@/components/charts/WeekdayPunctualityChart';
import { useDashboardTrends, type TrendRange } from '@/hooks/queries/useDashboardTrends';
import { useDateFormat } from '@/hooks/useDateFormat';
import { cn } from '@/lib/utils';

/**
 * The "how are we doing lately" half of the dashboard, below the live
 * who's-in-today board.
 *
 * One range control scopes every card underneath it, so the stat tiles, the
 * trend columns and the two breakdowns always describe the same slice.
 *
 * `personal` renders the same data for a single employee — the API already
 * scopes the response to the caller when they aren't an owner or a manager
 * with `manage_attendance`, so the only difference here is dropping the
 * leaderboard, which would be a one-row chart of the reader themself.
 */
export function DashboardInsights({
  workspaceId,
  personal = false,
}: {
  workspaceId: string;
  personal?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [range, setRange] = useState<TrendRange>(14);
  const { data, isPending, isFetching } = useDashboardTrends(workspaceId, range);
  const fmtDate = useDateFormat();

  // Range switches keep the previous window on screen; only the very first
  // load gets skeletons, so changing the filter never collapses the layout.
  const isStale = isFetching && !isPending;

  if (isPending || !data) return <InsightsSkeleton />;

  const { totals, daily } = data;
  const attendanceDelta =
    totals.previousAttendanceRate > 0 ? totals.attendanceRate - totals.previousAttendanceRate : null;
  const onTimeDelta =
    totals.previousOnTimeRate > 0 ? totals.onTimeRate - totals.previousOnTimeRate : null;

  return (
    <section className="mb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2
          className="text-[19px] font-semibold text-text-primary"
          style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif" }}
        >
          {personal
            ? t('dashboard.myTrendsTitle', 'My attendance trend')
            : t('dashboard.trendsTitle', 'Trends')}
        </h2>
        <RangeToggle value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <TrendStatCard
          label={t('dashboard.attendanceRate', 'Attendance rate')}
          value={totals.attendanceRate}
          hint={t('charts.presentOfExpected', {
            present: totals.present,
            expected: totals.expected,
            defaultValue: '{{present}} of {{expected}} expected shifts worked',
          })}
          delta={attendanceDelta}
          series={daily.map((d) => d.attendanceRate)}
          color="var(--db-chart-ontime)"
          isStale={isStale}
        />
        <TrendStatCard
          label={t('dashboard.onTimeRate', 'On-time rate')}
          value={totals.onTimeRate}
          hint={t('charts.onTimeOfPresent', {
            onTime: totals.onTime,
            present: totals.present,
            defaultValue: '{{onTime}} of {{present}} shifts started on time',
          })}
          delta={onTimeDelta}
          series={daily.map((d) => d.onTimeRate)}
          color="var(--db-chart-leave)"
          isStale={isStale}
        />
        <TrendStatCard
          label={t('charts.lateArrivals', 'Late arrivals')}
          value={totals.late}
          suffix=""
          hint={t('charts.absentAndLeave', {
            absent: totals.absent,
            leave: totals.leave,
            defaultValue: '{{absent}} absent · {{leave}} on leave',
          })}
          delta={null}
          series={daily.map((d) => d.late)}
          color="var(--db-chart-late)"
          isStale={isStale}
        />
      </div>

      <GlassCard hover={false} className="mb-4">
        <GlassCardHeader
          title={t('charts.attendanceTrend', 'Attendance over time')}
          action={
            <span className="text-xs text-text-tertiary tabular-nums">
              {fmtDate(data.from)} – {fmtDate(data.to)}
            </span>
          }
        />
        <AttendanceTrendChart
          daily={daily}
          formatDate={fmtDate}
          locale={i18n.language}
          isStale={isStale}
        />
      </GlassCard>

      <div className={cn('grid grid-cols-1 gap-4', !personal && 'lg:grid-cols-2')}>
        <GlassCard hover={false}>
          <GlassCardHeader title={t('charts.punctualityByWeekday', 'Punctuality by weekday')} />
          <WeekdayPunctualityChart
            byWeekday={data.byWeekday}
            locale={i18n.language}
            isStale={isStale}
          />
        </GlassCard>

        {!personal && (
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t('charts.mostLateArrivals', 'Most late arrivals')}
            action={
              <Link to="/console/attendance" className="text-xs text-amber font-medium no-underline">
                {t('dashboard.viewAll', 'View all')} &rarr;
              </Link>
            }
          />
          <LateLeaderboard
            topLate={data.topLate}
            isStale={isStale}
            renderName={(employee) => (
              <Link
                to="/console/employees/$publicId"
                params={{ publicId: employee.employeePublicId }}
                className="text-text-primary no-underline hover:text-coffee"
              >
                {employee.employeeName}
              </Link>
            )}
          />
        </GlassCard>
        )}
      </div>
    </section>
  );
}

function InsightsSkeleton() {
  return (
    <section className="mb-6" aria-busy="true">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} hover={false}>
            <div className="p-4 space-y-3">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-7" />
            </div>
          </GlassCard>
        ))}
      </div>
      <GlassCard hover={false}>
        <div className="p-5 space-y-3">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-[168px]" />
        </div>
      </GlassCard>
    </section>
  );
}
