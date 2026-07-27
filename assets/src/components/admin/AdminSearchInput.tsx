import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSearchInputProps {
  /** Also used as the input `name` — every input needs a stable id/name pair. */
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Visually-hidden label text, read by screen readers. */
  label: string;
  className?: string;
}

export function AdminSearchInput({
  id,
  value,
  onChange,
  placeholder,
  label,
  className,
}: AdminSearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
      />
      <input
        id={id}
        name={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        // Safari paints its own clear affordance on type="search"; ours is
        // styled to match the rest of the console, so suppress the native one.
        className="w-full pl-9 pr-9 py-2 rounded-lg text-[14.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee transition-colors [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value !== '' && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          title="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-cream-3 bg-transparent border-none cursor-pointer transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
