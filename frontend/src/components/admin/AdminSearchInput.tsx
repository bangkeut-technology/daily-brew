"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
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
        className="w-full rounded-lg border border-cream-3 bg-glass-bg py-2 pl-9 pr-9 text-[15px] text-text-primary outline-none transition-colors focus:border-coffee [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value !== "" && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          title="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-cream-3 hover:text-text-primary"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
