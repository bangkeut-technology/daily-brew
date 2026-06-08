import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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
  renderOption?: (option: SelectOption, index: number) => React.ReactNode;
  renderSelected?: (option: SelectOption) => React.ReactNode;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  dropUp: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className = '',
  searchable,
  renderOption,
  renderSelected,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);

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

  // Anchor the portaled menu to the trigger; recompute on scroll/resize so
  // it tracks the trigger even when an ancestor scrolls.
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // 340px = 280 (options max-h) + ~50 (search bar when shown at 8+ opts)
      // + py-1 padding + sideOffset. Earlier 320 clipped the bottom of the
      // menu when triggers had 320–335px below them.
      const dropUp = spaceBelow < 340;
      setPosition({
        top: dropUp ? rect.top : rect.bottom,
        left: rect.left,
        width: rect.width,
        dropUp,
      });
    };
    update();
    // capture phase catches scroll on any ancestor, not just window
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
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
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none transition-colors cursor-pointer focus:border-coffee focus:ring-1 focus:ring-coffee/20"
      >
        <span className={cn('flex items-center gap-2 min-w-0', !selected && 'text-text-tertiary')}>
          {selected ? (renderSelected ? renderSelected(selected) : selected.label) : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn('text-text-tertiary transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && position && createPortal(
        <div
          ref={dropdownRef}
          className="fixed rounded-xl bg-cream dark:bg-[#1E1916] border border-glass-border shadow-lg overflow-hidden z-[9999] pointer-events-auto"
          style={{
            left: position.left,
            width: position.width,
            ...(position.dropUp
              ? { bottom: window.innerHeight - position.top + 4 }
              : { top: position.top + 4 }),
          }}
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
                  placeholder="Search…"
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg text-[14.5px] bg-cream-3/30 border border-cream-3/60 text-text-primary outline-none focus:border-coffee transition-colors"
                />
              </div>
            </div>
          )}
          <div className="max-h-[280px] overflow-y-auto overscroll-contain py-1" style={{ touchAction: 'pan-y' }}>
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[14px] text-text-tertiary text-center">No results</p>
            ) : (
              filtered.map((option, idx) => (
                <button
                  key={option.value}
                  type="button"
                  // preventDefault on mousedown stops the option from taking
                  // focus, which is what triggers Radix Dialog's FocusScope
                  // (the menu is portaled to document.body, outside the
                  // Dialog.Content DOM tree, so the focus-trap classifies
                  // the option as "outside" and redirects focus away —
                  // disrupting the mousedown→mouseup→click sequence the
                  // browser uses to fire onClick). Click still fires
                  // normally; focus stays on the trigger.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-[15px] text-left border-none cursor-pointer transition-colors',
                    option.value === value
                      ? 'bg-coffee/10 text-coffee font-medium'
                      : 'bg-transparent text-text-primary hover:bg-cream-3/40'
                  )}
                >
                  <span className="flex-1 flex items-center gap-2 min-w-0">
                    {renderOption ? renderOption(option, idx) : option.label}
                  </span>
                  {option.value === value && <Check size={13} className="text-coffee flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
