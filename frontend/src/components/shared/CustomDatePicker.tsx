"use client";

import { useState, useRef, useLayoutEffect, useEffect, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  className?: string;
  isDateDisabled?: (dateStr: string) => boolean;
  /** Override "today" (YYYY-MM-DD) for workspace-TZ-aware highlight. */
  todayOverride?: string;
  id?: string;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function parseYMD(s: string): [number, number, number] {
  const [y, m, d] = s.split("-").map(Number);
  return [y, m - 1, d];
}
function formatDate(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}
function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

type PickerView = "days" | "months" | "years";

export function CustomDatePicker({
  value,
  onChange,
  className = "",
  isDateDisabled,
  todayOverride,
  id,
}: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [pickerView, setPickerView] = useState<PickerView>("days");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);
  const selectedYearButtonRef = useRef<HTMLButtonElement>(null);
  const [dropUp, setDropUp] = useState(false);

  const [initY, initM] = value ? parseYMD(value) : [new Date().getFullYear(), new Date().getMonth()];
  const [viewYear, setViewYear] = useState(initY);
  const [viewMonth, setViewMonth] = useState(initM);

  // Open from the trigger: resync the view to the selected month (no effect needed).
  const toggleOpen = () => {
    if (!open) {
      const [y, m] = value
        ? parseYMD(value)
        : [new Date().getFullYear(), new Date().getMonth()];
      setViewYear(y);
      setViewMonth(m);
      setPickerView("days");
    }
    setOpen(!open);
  };

  // Close on outside click (event listener — not setState-in-effect).
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // DOM measurement — legitimately needs a layout effect.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropUp(window.innerHeight - rect.bottom < 340);
  }, [open]);

  useLayoutEffect(() => {
    if (pickerView !== "years" || !selectedYearButtonRef.current || !yearListRef.current) return;
    const btn = selectedYearButtonRef.current;
    const list = yearListRef.current;
    list.scrollTop = btn.offsetTop - list.clientHeight / 2 + btn.clientHeight / 2;
  }, [pickerView, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else setViewMonth(viewMonth + 1);
  };

  const cells = useMemo(() => {
    const daysInMonth = getMonthDays(viewYear, viewMonth);
    const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
    const items: { day: number; current: boolean }[] = [];
    const prevMonthDays = getMonthDays(viewYear, viewMonth - 1);
    for (let i = firstDay - 1; i >= 0; i--) items.push({ day: prevMonthDays - i, current: false });
    for (let d = 1; d <= daysInMonth; d++) items.push({ day: d, current: true });
    for (let d = 1; d <= 42 - items.length; d++) items.push({ day: d, current: false });
    return items;
  }, [viewYear, viewMonth]);

  const [selectedYear, selectedMonth, selectedDay] = value ? parseYMD(value) : [-1, -1, -1];
  const todayStr =
    todayOverride ??
    (() => {
      const t = new Date();
      return formatDate(t.getFullYear(), t.getMonth(), t.getDate());
    })();
  const [todayYear, todayMonth] = parseYMD(todayStr);

  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 100 }, (_, i) => currentYear - 80 + i);

  const displayValue = value
    ? (() => {
        const [y, m, d] = parseYMD(value);
        return new Date(y, m, d).toLocaleDateString("default", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      })()
    : "";

  const navBtn =
    "flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-text-tertiary transition-colors hover:bg-cream-3/40 hover:text-text-primary";

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={toggleOpen}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20"
      >
        <CalendarDays size={14} className="flex-shrink-0 text-text-tertiary" />
        <span className={cn(!displayValue && "text-text-tertiary")}>
          {displayValue || "Select date"}
        </span>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 z-[9999] w-[280px] overflow-hidden rounded-xl border border-glass-border bg-cream shadow-lg dark:bg-[#1E1916]"
          style={dropUp ? { bottom: "100%", marginBottom: 4 } : { top: "100%", marginTop: 4 }}
        >
          <div className="flex items-center justify-between border-b border-cream-3/60 px-3 py-2.5">
            <button type="button" onClick={prevMonth} className={navBtn}>
              <ChevronLeft size={15} />
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPickerView(pickerView === "months" ? "days" : "months")}
                className={cn(
                  "flex cursor-pointer items-center gap-0.5 rounded-md border-none px-2 py-1 text-[15px] font-semibold transition-colors",
                  pickerView === "months"
                    ? "bg-coffee/10 text-coffee"
                    : "bg-transparent text-text-primary hover:bg-cream-3/40",
                )}
              >
                {MONTHS[viewMonth].slice(0, 3)}
                <ChevronDown size={11} className="text-text-tertiary" />
              </button>
              <button
                type="button"
                onClick={() => setPickerView(pickerView === "years" ? "days" : "years")}
                className={cn(
                  "flex cursor-pointer items-center gap-0.5 rounded-md border-none px-2 py-1 text-[15px] font-semibold transition-colors",
                  pickerView === "years"
                    ? "bg-coffee/10 text-coffee"
                    : "bg-transparent text-text-primary hover:bg-cream-3/40",
                )}
              >
                {viewYear}
                <ChevronDown size={11} className="text-text-tertiary" />
              </button>
            </div>
            <button type="button" onClick={nextMonth} className={navBtn}>
              <ChevronRight size={15} />
            </button>
          </div>

          {pickerView === "months" && (
            <div className="grid grid-cols-3 gap-1 p-2">
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setViewMonth(i);
                    setPickerView("days");
                  }}
                  className={cn(
                    "cursor-pointer rounded-lg border-none py-2 text-[14px] font-medium transition-colors",
                    i === viewMonth
                      ? "bg-coffee text-white"
                      : i === todayMonth && viewYear === todayYear
                        ? "bg-amber/12 text-amber hover:bg-amber/20"
                        : "bg-transparent text-text-primary hover:bg-cream-3/40",
                  )}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {pickerView === "years" && (
            <div
              ref={yearListRef}
              className="grid max-h-[220px] grid-cols-4 gap-1 overflow-y-auto p-2"
            >
              {yearRange.map((y) => (
                <button
                  key={y}
                  ref={y === viewYear ? selectedYearButtonRef : undefined}
                  type="button"
                  onClick={() => {
                    setViewYear(y);
                    setPickerView("months");
                  }}
                  className={cn(
                    "cursor-pointer rounded-lg border-none py-2 text-[14px] font-medium transition-colors",
                    y === viewYear
                      ? "bg-coffee text-white"
                      : y === todayYear
                        ? "bg-amber/12 text-amber hover:bg-amber/20"
                        : "bg-transparent text-text-primary hover:bg-cream-3/40",
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {pickerView === "days" && (
            <>
              <div className="grid grid-cols-7 px-2 pt-2">
                {WEEKDAYS.map((d) => (
                  <span key={d} className="py-1 text-center text-[12px] font-medium text-text-tertiary">
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 px-2 pb-2">
                {cells.map((cell, i) => {
                  if (!cell.current) {
                    return (
                      <span
                        key={i}
                        className="mx-auto flex h-8 w-8 items-center justify-center text-[14px] text-text-tertiary/40"
                      >
                        {cell.day}
                      </span>
                    );
                  }
                  const dateStr = formatDate(viewYear, viewMonth, cell.day);
                  const isSelected =
                    cell.day === selectedDay && viewMonth === selectedMonth && viewYear === selectedYear;
                  const isToday = dateStr === todayStr;
                  const isDisabled = isDateDisabled?.(dateStr) ?? false;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDisabled) return;
                        onChange(dateStr);
                        setOpen(false);
                      }}
                      className={cn(
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-lg border-none text-[14px] transition-colors",
                        isDisabled ? "cursor-not-allowed line-through opacity-30" : "cursor-pointer",
                        !isDisabled && isSelected
                          ? "bg-coffee font-semibold text-white"
                          : !isDisabled && isToday
                            ? "bg-amber/12 font-medium text-amber hover:bg-amber/20"
                            : !isDisabled
                              ? "bg-transparent text-text-primary hover:bg-cream-3/40"
                              : "",
                      )}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
