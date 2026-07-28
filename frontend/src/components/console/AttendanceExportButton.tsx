"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiAxios } from "@/lib/api";
import { cn } from "@/lib/utils";

type ExportFormat = "xlsx" | "pdf";

interface Props {
  workspacePublicId: string;
  from: string;
  to: string;
  /** Optional employee filter — server-side narrowing. */
  employeePublicId?: string;
  /** Workspace name slug for filename fallback (the server-side name is canonical). */
  workspaceLabel?: string;
  /** False when the plan doesn't allow export; the trigger is disabled with a tooltip. */
  canExport: boolean;
}

export function AttendanceExportButton({
  workspacePublicId,
  from,
  to,
  employeePublicId,
  workspaceLabel,
  canExport,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const run = async (format: ExportFormat) => {
    setOpen(false);
    setBusy(format);
    try {
      const response = await apiAxios.get<Blob>(
        `/workspaces/${workspacePublicId}/attendances/export.${format}`,
        {
          params: { from, to, ...(employeePublicId ? { employeePublicId } : {}) },
          responseType: "blob",
        },
      );

      const filename =
        filenameFromHeader(response.headers["content-disposition"] as string | undefined) ??
        `${workspaceLabel ?? "attendance"}-${from}-to-${to}.${format}`;

      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 402) {
        toast.error(t("attendance.exportEspressoRequired", "Export requires Espresso plan"));
      } else {
        toast.error(t("attendance.exportError", "Failed to export attendance"));
      }
    } finally {
      setBusy(null);
    }
  };

  const disabled = !canExport || busy !== null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => canExport && setOpen((o) => !o)}
        disabled={disabled}
        title={
          !canExport
            ? t("attendance.exportEspressoRequired", "Export requires Espresso plan")
            : undefined
        }
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-cream-3 bg-glass-bg px-4 py-2 text-[15px] font-medium text-text-primary transition-all duration-150",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-glass-bg",
        )}
      >
        {busy !== null ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>{t("attendance.export", "Export")}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {open && canExport && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-20 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-cream-3 bg-cream shadow-lg"
        >
          <button
            type="button"
            onClick={() => run("xlsx")}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-text-primary hover:bg-glass-bg"
          >
            <FileSpreadsheet className="h-4 w-4 text-green" />
            {t("attendance.exportExcel", "Export to Excel")}
          </button>
          <button
            type="button"
            onClick={() => run("pdf")}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-text-primary hover:bg-glass-bg"
          >
            <FileText className="h-4 w-4 text-red" />
            {t("attendance.exportPdf", "Export to PDF")}
          </button>
        </div>
      )}
    </div>
  );
}

function filenameFromHeader(header: string | undefined): string | null {
  if (!header) return null;
  const match = header.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}
