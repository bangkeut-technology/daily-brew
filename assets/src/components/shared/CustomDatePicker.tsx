import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  className?: string;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

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
  return day === 0 ? 6 : day - 1;
}

type PickerView = 'days' | 'months' | 'years';

export function CustomDatePicker({ value, onChange, className = '' }: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [pickerView, setPickerView] = useState<PickerView>('days');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropUp, setDropUp] = useState(false);

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
    if (!open) setPickerView('days');
  }, [open]);

  // Close on outside click
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

  // Determine drop direction
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropUp(window.innerHeight - rect.bottom < 340);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const cells = useMemo(() => {
    const daysInMonth = getMonthDays(viewYear, viewMonth);
    const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
    const items: { day: number; current: boolean }[] = [];

    const prevMonthDays = getMonthDays(viewYear, viewMonth - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      items.push({ day: prevMonthDays - i, current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      items.push({ day: d, current: true });
    }
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

  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 100 }, (_, i) => currentYear - 80 + i);

  const displayValue = value
    ? new Date(value).toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none transition-colors cursor-pointer focus:border-coffee focus:ring-1 focus:ring-coffee/20"
      >
        <CalendarDays size={14} className="text-text-tertiary flex-shrink-0" />
        <span className={cn(!displayValue && 'text-text-tertiary')}>
          {displayValue || 'Select date'}
        </span>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 w-[280px] rounded-xl bg-glass-bg backdrop-blur-xl border border-glass-border shadow-lg overflow-hidden z-[9999]"
          style={dropUp ? { bottom: '100%', marginBottom: 4 } : { top: '100%', marginTop: 4 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-cream-3/60">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-tertiary hover:bg-cream-3/40 hover:text-text-primary transition-colors"
            >
              <ChevronLeft size={15} />
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPickerView(pickerView === 'months' ? 'days' : 'months')}
                className={cn(
                  'flex items-center gap-0.5 px-2 py-1 rounded-md text-[13px] font-semibold border-none cursor-pointer transition-colors',
                  pickerView === 'months'
                    ? 'bg-coffee/10 text-coffee'
                    : 'bg-transparent text-text-primary hover:bg-cream-3/40'
                )}
              >
                {MONTHS[viewMonth].slice(0, 3)}
                <ChevronDown size={11} className="text-text-tertiary" />
              </button>

              <button
                type="button"
                onClick={() => setPickerView(pickerView === 'years' ? 'days' : 'years')}
                className={cn(
                  'flex items-center gap-0.5 px-2 py-1 rounded-md text-[13px] font-semibold border-none cursor-pointer transition-colors',
                  pickerView === 'years'
                    ? 'bg-coffee/10 text-coffee'
                    : 'bg-transparent text-text-primary hover:bg-cream-3/40'
                )}
              >
                {viewYear}
                <ChevronDown size={11} className="text-text-tertiary" />
              </button>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-tertiary hover:bg-cream-3/40 hover:text-text-primary transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Month picker */}
          {pickerView === 'months' && (
            <div className="grid grid-cols-3 gap-1 p-2">
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setViewMonth(i); setPickerView('days'); }}
                  className={cn(
                    'py-2 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors',
                    i === viewMonth
                      ? 'bg-coffee text-white'
                      : i === today.getMonth() && viewYear === today.getFullYear()
                        ? 'bg-amber/12 text-amber hover:bg-amber/20'
                        : 'bg-transparent text-text-primary hover:bg-cream-3/40'
                  )}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {/* Year picker */}
          {pickerView === 'years' && (
            <div className="grid grid-cols-4 gap-1 p-2 max-h-[220px] overflow-y-auto">
              {yearRange.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => { setViewYear(y); setPickerView('months'); }}
                  className={cn(
                    'py-2 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors',
                    y === viewYear
                      ? 'bg-coffee text-white'
                      : y === today.getFullYear()
                        ? 'bg-amber/12 text-amber hover:bg-amber/20'
                        : 'bg-transparent text-text-primary hover:bg-cream-3/40'
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* Days view */}
          {pickerView === 'days' && (
            <>
              <div className="grid grid-cols-7 px-2 pt-2">
                {WEEKDAYS.map((d) => (
                  <span key={d} className="text-[10px] font-medium text-text-tertiary text-center py-1">
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
                      className={cn(
                        'w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-[12px] border-none cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-coffee text-white font-semibold'
                          : isToday
                            ? 'bg-amber/12 text-amber font-medium hover:bg-amber/20'
                            : 'bg-transparent text-text-primary hover:bg-cream-3/40'
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
