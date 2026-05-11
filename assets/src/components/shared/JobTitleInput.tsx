import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

const SUGGESTIONS: readonly string[] = [
  'Owner',
  'General Manager',
  'Manager',
  'Assistant Manager',
  'Shift Lead',
  'Supervisor',
  'Head Chef',
  'Sous Chef',
  'Chef',
  'Line Cook',
  'Prep Cook',
  'Pastry Chef',
  'Baker',
  'Barista',
  'Bartender',
  'Server',
  'Waiter',
  'Waitress',
  'Host',
  'Hostess',
  'Cashier',
  'Runner',
  'Busser',
  'Dishwasher',
  'Expediter',
  'Delivery Driver',
  'Cleaner',
];

interface JobTitleInputProps {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  /** Job titles already used elsewhere in the workspace — surfaced first. */
  workspaceValues?: readonly string[];
}

export function JobTitleInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  workspaceValues,
}: JobTitleInputProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [dropUp, setDropUp] = useState(false);

  // Workspace values surface first, then the curated list. Dedupe is
  // case-insensitive but keeps the casing the workspace uses.
  const options = useMemo(() => {
    const seen = new Set<string>();
    const out: { label: string; source: 'workspace' | 'common' }[] = [];
    for (const w of workspaceValues ?? []) {
      const key = w.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({ label: w.trim(), source: 'workspace' });
    }
    for (const c of SUGGESTIONS) {
      const key = c.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ label: c, source: 'common' });
    }
    return out;
  }, [workspaceValues]);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [value, options]);

  // Reset highlight when the filter set changes.
  useEffect(() => {
    setHighlight(0);
  }, [filtered.length]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Flip dropdown direction if there's no room below.
  useLayoutEffect(() => {
    if (!open || !inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropUp(window.innerHeight - rect.bottom < 260);
  }, [open]);

  // Keep highlighted item in view.
  useLayoutEffect(() => {
    if (!open || !listRef.current) return;
    const node = listRef.current.querySelector<HTMLElement>(`[data-idx="${highlight}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  const choose = (s: string) => {
    onChange(s);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && open && filtered[highlight]) {
      e.preventDefault();
      choose(filtered[highlight].label);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', open && 'z-[100]')}>
      <input
        ref={inputRef}
        id={id}
        name={name ?? id}
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-colors',
          className,
        )}
      />

      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-0 w-full rounded-xl bg-cream dark:bg-[#1E1916] border border-glass-border shadow-lg overflow-hidden z-[9999]"
          style={dropUp ? { bottom: '100%', marginBottom: 4 } : { top: '100%', marginTop: 4 }}
        >
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.map((opt, idx) => (
              <button
                key={`${opt.source}:${opt.label}`}
                type="button"
                data-idx={idx}
                onMouseDown={(e) => {
                  // Prevent input blur before click fires.
                  e.preventDefault();
                  choose(opt.label);
                }}
                onMouseEnter={() => setHighlight(idx)}
                className={cn(
                  'w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-[15px] border-none cursor-pointer transition-colors',
                  idx === highlight
                    ? 'bg-coffee/10 text-coffee font-medium'
                    : 'bg-transparent text-text-primary hover:bg-cream-3/40',
                )}
              >
                <span className="truncate">{opt.label}</span>
                {opt.source === 'workspace' && (
                  <span className="text-[11px] text-text-tertiary flex-shrink-0">In use</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
