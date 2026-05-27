"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomTimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  className?: string;
  id?: string;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function parseTime(value: string): [number, number] {
  const [h, m] = value.split(":").map(Number);
  return [h ?? 0, m ?? 0];
}

export function CustomTimePicker({ value, onChange, className = "", id }: CustomTimePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hour, minute] = parseTime(value);
  const [dropUp, setDropUp] = useState(false);

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

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropUp(window.innerHeight - rect.bottom < 180);
  }, [open]);

  const setHour = (h: number) => onChange(`${pad(((h % 24) + 24) % 24)}:${pad(minute)}`);
  const setMinute = (m: number) => onChange(`${pad(hour)}:${pad(((m % 60) + 60) % 60)}`);

  const stepButton = "flex h-7 w-9 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-text-tertiary transition-colors hover:bg-cream-3/40 hover:text-text-primary";
  const digit = "flex h-9 w-9 items-center justify-center rounded-lg bg-coffee/10 font-mono text-[17px] font-semibold tabular-nums text-coffee";

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20"
      >
        <Clock size={14} className="flex-shrink-0 text-text-tertiary" />
        <span className="font-mono tabular-nums">{value || "00:00"}</span>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 z-[9999] overflow-hidden rounded-xl border border-glass-border bg-cream shadow-lg dark:bg-[#1E1916]"
          style={dropUp ? { bottom: "100%", marginBottom: 4 } : { top: "100%", marginTop: 4 }}
        >
          <div className="flex items-center gap-1 p-3">
            <div className="flex flex-col items-center gap-0.5">
              <button type="button" onClick={() => setHour(hour + 1)} className={stepButton}>
                <ChevronUp size={14} />
              </button>
              <span className={digit}>{pad(hour)}</span>
              <button type="button" onClick={() => setHour(hour - 1)} className={stepButton}>
                <ChevronDown size={14} />
              </button>
            </div>

            <span className="px-0.5 text-[18px] font-semibold text-text-tertiary">:</span>

            <div className="flex flex-col items-center gap-0.5">
              <button type="button" onClick={() => setMinute(minute + 5)} className={stepButton}>
                <ChevronUp size={14} />
              </button>
              <span className={digit}>{pad(minute)}</span>
              <button type="button" onClick={() => setMinute(minute - 5)} className={stepButton}>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
