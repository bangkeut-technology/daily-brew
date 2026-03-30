import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomTimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  className?: string;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function parseTime(value: string): [number, number] {
  const [h, m] = value.split(':').map(Number);
  return [h ?? 0, m ?? 0];
}

export function CustomTimePicker({ value, onChange, className = '' }: CustomTimePickerProps) {
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
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropUp(window.innerHeight - rect.bottom < 180);
  }, [open]);

  const setHour = (h: number) => {
    const clamped = ((h % 24) + 24) % 24;
    onChange(`${pad(clamped)}:${pad(minute)}`);
  };

  const setMinute = (m: number) => {
    const clamped = ((m % 60) + 60) % 60;
    onChange(`${pad(hour)}:${pad(clamped)}`);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none transition-colors cursor-pointer focus:border-coffee focus:ring-1 focus:ring-coffee/20"
      >
        <Clock size={14} className="text-text-tertiary flex-shrink-0" />
        <span className="font-mono tabular-nums">{value || '00:00'}</span>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 rounded-xl bg-glass-bg backdrop-blur-xl border border-glass-border shadow-lg overflow-hidden z-[9999]"
          style={dropUp ? { bottom: '100%', marginBottom: 4 } : { top: '100%', marginTop: 4 }}
        >
          <div className="flex items-center gap-1 p-3">
            {/* Hour */}
            <div className="flex flex-col items-center gap-0.5">
              <button
                type="button"
                onClick={() => setHour(hour + 1)}
                className="w-9 h-7 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-tertiary hover:bg-cream-3/40 hover:text-text-primary transition-colors"
              >
                <ChevronUp size={14} />
              </button>
              <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-coffee/10 text-[15px] font-mono font-semibold text-coffee tabular-nums">
                {pad(hour)}
              </span>
              <button
                type="button"
                onClick={() => setHour(hour - 1)}
                className="w-9 h-7 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-tertiary hover:bg-cream-3/40 hover:text-text-primary transition-colors"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <span className="text-[16px] font-semibold text-text-tertiary px-0.5">:</span>

            {/* Minute */}
            <div className="flex flex-col items-center gap-0.5">
              <button
                type="button"
                onClick={() => setMinute(minute + 5)}
                className="w-9 h-7 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-tertiary hover:bg-cream-3/40 hover:text-text-primary transition-colors"
              >
                <ChevronUp size={14} />
              </button>
              <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-coffee/10 text-[15px] font-mono font-semibold text-coffee tabular-nums">
                {pad(minute)}
              </span>
              <button
                type="button"
                onClick={() => setMinute(minute - 5)}
                className="w-9 h-7 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-tertiary hover:bg-cream-3/40 hover:text-text-primary transition-colors"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
