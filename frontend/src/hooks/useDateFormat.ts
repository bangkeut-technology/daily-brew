"use client";

import { useCallback } from "react";
import { getWorkspacePublicId } from "@/lib/api";
import { useWorkspaceSettings } from "@/hooks/useWorkspaceSettings";

/**
 * Format a date string according to the workspace date-format setting. UTC
 * getters on date-only strings, because `new Date('2026-07-27')` is parsed as
 * UTC midnight and renders as the previous day west of Greenwich.
 */
export function formatDate(dateStr: string, format: string = "DD/MM/YYYY"): string {
  if (!dateStr) return "";

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  const d = isDateOnly ? new Date(`${dateStr}T00:00:00Z`) : new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;

  const day = (isDateOnly ? d.getUTCDate() : d.getDate()).toString().padStart(2, "0");
  const month = ((isDateOnly ? d.getUTCMonth() : d.getMonth()) + 1).toString().padStart(2, "0");
  const year = isDateOnly ? d.getUTCFullYear() : d.getFullYear();

  switch (format) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

/** Returns a formatter bound to the workspace's date-format setting. */
export function useDateFormat() {
  const workspaceId = getWorkspacePublicId() || "";
  const { data: settings } = useWorkspaceSettings(workspaceId);
  const df = settings?.dateFormat || "DD/MM/YYYY";

  return useCallback((dateStr: string) => formatDate(dateStr, df), [df]);
}
