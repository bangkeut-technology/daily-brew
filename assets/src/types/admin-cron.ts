/**
 * Wire-shape types for the admin cron console. The server mirror lives at
 * src/DTO/Admin/{ScheduledCommandDTO, LastRunDTO}.php and the controller
 * App\ApiController\Admin\AdminCronController.
 */

export type CronRunStatus = 'running' | 'success' | 'failed';

export interface CronLastRun {
  publicId: string;
  command: string;
  startedAt: string;
  finishedAt: string | null;
  status: CronRunStatus;
  exitCode: number | null;
  outputTail: string | null;
  triggeredByEmail: string | null;
}

export interface ScheduledCommand {
  id: number;
  name: string;
  command: string;
  arguments: string | null;
  cronExpression: string;
  cronExpressionTranslated: string;
  disabled: boolean;
  locked: boolean;
  executeImmediately: boolean;
  priority: number;
  lastExecution: string | null;
  lastReturnCode: number | null;
  nextRunDate: string | null;
  lastRun: CronLastRun | null;
}

export interface CronJobOption {
  command: string;
  label: string;
  description: string;
  suggestedCron: string;
}

export interface CronScheduleInput {
  command?: string;
  name?: string;
  cronExpression?: string;
  arguments?: string;
  priority?: number;
  disabled?: boolean;
}

export interface CronRunResult {
  exitCode: number;
  startedAt: string | null;
  finishedAt: string;
  outputTail: string | null;
}
