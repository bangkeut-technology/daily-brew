import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  searchable?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select\u2026',
  className = '',
  searchable,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [dropUp, setDropUp] = useState(false);

  const showSearch = searchable ?? options.length > 8;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
      setSearch('');
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Determine drop direction
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropUp(window.innerHeight - rect.bottom < 260);
  }, [open]);

  useEffect(() => {
    if (open && showSearch) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open, showSearch]);

  const selected = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none transition-colors cursor-pointer focus:border-coffee focus:ring-1 focus:ring-coffee/20"
      >
        <span className={cn(!selected && 'text-text-tertiary')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn('text-text-tertiary transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 w-full rounded-xl bg-glass-bg backdrop-blur-xl border border-glass-border shadow-lg overflow-hidden z-[9999]"
          style={dropUp ? { bottom: '100%', marginBottom: 4 } : { top: '100%', marginTop: 4 }}
        >
          {showSearch && (
            <div className="px-2 pt-2 pb-1">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search\u2026"
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg text-[12.5px] bg-cream-3/30 border border-cream-3/60 text-text-primary outline-none focus:border-coffee transition-colors"
                />
              </div>
            </div>
          )}
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-text-tertiary text-center">No results</p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left border-none cursor-pointer transition-colors',
                    option.value === value
                      ? 'bg-coffee/10 text-coffee font-medium'
                      : 'bg-transparent text-text-primary hover:bg-cream-3/40'
                  )}
                >
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && <Check size={13} className="text-coffee flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
