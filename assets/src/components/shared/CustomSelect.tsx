import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

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
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className = '',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none transition-colors cursor-pointer focus:border-coffee focus:ring-1 focus:ring-coffee/20"
      >
        <span className={selected ? '' : 'text-text-tertiary'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-glass-bg backdrop-blur-xl border border-glass-border shadow-lg overflow-hidden">
          <div className="max-h-[220px] overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left border-none cursor-pointer transition-colors ${
                  option.value === value
                    ? 'bg-coffee/10 text-coffee font-medium'
                    : 'bg-transparent text-text-primary hover:bg-cream-3/40'
                }`}
              >
                <span className="flex-1">{option.label}</span>
                {option.value === value && <Check size={13} className="text-coffee flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
