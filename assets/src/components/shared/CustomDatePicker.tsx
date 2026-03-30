import { useState, useRef, useEffect, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  className?: string;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export function CustomDatePicker({ value, onChange, className = '' }: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value, open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const cells = useMemo(() => {
    const daysInMonth = getMonthDays(viewYear, viewMonth);
    const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
    const items: { day: number; current: boolean }[] = [];

    // Previous month trailing days
    const prevMonthDays = getMonthDays(viewYear, viewMonth - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      items.push({ day: prevMonthDays - i, current: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      items.push({ day: d, current: true });
    }

    // Fill remaining to complete the grid
    const remaining = 42 - items.length;
    for (let d = 1; d <= remaining; d++) {
      items.push({ day: d, current: false });
    }

    return items;
  }, [viewYear, viewMonth]);

  const selectedDay = value ? new Date(value).getDate() : -1;
  const selectedMonth = value ? new Date(value).getMonth() : -1;
  const selectedYear = value ? new Date(value).getFullYear() : -1;

  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const displayValue = value
    ? new Date(value).toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none transition-colors cursor-pointer focus:border-coffee focus:ring-1 focus:ring-coffee/20"
      >
        <CalendarDays size={14} className="text-text-tertiary flex-shrink-0" />
        <span className={displayValue ? '' : 'text-text-tertiary'}>
          {displayValue || 'Select date'}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-[280px] rounded-xl bg-glass-bg backdrop-blur-xl border border-glass-border shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-cream-3/60">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-tertiary hover:bg-cream-3/40 hover:text-text-primary transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-[13px] font-semibold text-text-primary">{monthLabel}</span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-tertiary hover:bg-cream-3/40 hover:text-text-primary transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 px-2 pt-2">
            {WEEKDAYS.map((d) => (
              <span key={d} className="text-[10px] font-medium text-text-tertiary text-center py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 px-2 pb-2">
            {cells.map((cell, i) => {
              if (!cell.current) {
                return (
                  <span
                    key={i}
                    className="w-8 h-8 flex items-center justify-center text-[12px] text-text-tertiary/40 mx-auto"
                  >
                    {cell.day}
                  </span>
                );
              }

              const dateStr = formatDate(viewYear, viewMonth, cell.day);
              const isSelected =
                cell.day === selectedDay &&
                viewMonth === selectedMonth &&
                viewYear === selectedYear;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(dateStr);
                    setOpen(false);
                  }}
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-[12px] border-none cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-coffee text-white font-semibold'
                      : isToday
                        ? 'bg-amber/12 text-amber font-medium hover:bg-amber/20'
                        : 'bg-transparent text-text-primary hover:bg-cream-3/40'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
