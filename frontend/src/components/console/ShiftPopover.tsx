"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import type { Shift } from "@/types/shift";

/**
 * Shift name that opens its hours and per-day overrides on click.
 *
 * Hand-rolled rather than pulled from a popover library: it's a single
 * click-outside panel, and the Next bundle has no popover primitive yet.
 */
export function ShiftPopover({
  shiftName,
  shiftPublicId,
  shifts,
}: {
  shiftName: string;
  shiftPublicId: string | null;
  shifts: Shift[] | undefined;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const shift = useMemo(
    () => shifts?.find((s) => s.publicId === shiftPublicId),
    [shifts, shiftPublicId],
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Nothing to expand into when the shift itself hasn't loaded.
  if (!shift) {
    return <span className="text-[15px] font-medium text-text-primary">{shiftName}</span>;
  }

  const duration = shiftDuration(shift.startTime, shift.endTime);

  return (
    <span ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer text-[15px] font-medium text-coffee underline decoration-dotted underline-offset-2 transition-colors hover:text-coffee-light"
      >
        {shiftName}
      </button>

      {open && (
        <span className="absolute left-0 top-full z-50 mt-1.5 block w-[220px] space-y-3 rounded-xl border border-glass-border bg-glass-bg p-4 shadow-lg backdrop-blur-xl">
          <span className="block">
            <span className="block text-base font-semibold text-text-primary">{shift.name}</span>
            <span className="mt-1.5 flex items-center gap-2">
              <Clock size={13} className="text-amber" />
              <span className="font-mono text-[15px] tabular-nums text-text-secondary">
                {shift.startTime} – {shift.endTime}
              </span>
            </span>
            <span className="mt-2 inline-block rounded-full bg-amber/10 px-2 py-0.5 text-[12.5px] font-medium text-amber">
              {duration}
            </span>
          </span>

          {shift.timeRules.length > 0 && (
            <span className="block border-t border-cream-3/60 pt-2">
              <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[1px] text-text-tertiary">
                {t("shifts.dayOverrides", "Day overrides")}
              </span>
              <span className="block space-y-1">
                {shift.timeRules.map((rule) => (
                  <span key={rule.publicId} className="flex items-center justify-between">
                    <span className="text-[13px] text-text-secondary">{rule.dayOfWeekLabel}</span>
                    <span className="font-mono text-[13px] tabular-nums text-text-tertiary">
                      {rule.startTime} – {rule.endTime}
                    </span>
                  </span>
                ))}
              </span>
            </span>
          )}
        </span>
      )}
    </span>
  );
}

/** "8h 30m", handling shifts that run past midnight. */
function shiftDuration(startTime: string, endTime: string): string {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  const total = endMin > startMin ? endMin - startMin : 1440 - startMin + endMin;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
}
