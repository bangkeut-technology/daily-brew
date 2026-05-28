"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
  id?: string;
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
  placeholder = "Select…",
  className = "",
  searchable,
  id,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  // Auto-search once the list gets long enough to scan.
  const showSearch = searchable ?? options.length > 8;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
      setSearch("");
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Anchor the portaled menu to the trigger; recompute on scroll/resize.
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const dropUp = window.innerHeight - rect.bottom < 260;
      setPosition({
        top: dropUp ? rect.top : rect.bottom,
        left: rect.left,
        width: rect.width,
        dropUp,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (open && showSearch) {
      const tid = setTimeout(() => searchRef.current?.focus(), 0);
      return () => clearTimeout(tid);
    }
  }, [open, showSearch]);

  const selected = options.find((o) => o.value === value);
  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20"
      >
        <span className={cn("flex min-w-0 items-center gap-2", !selected && "text-text-tertiary")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn("text-text-tertiary transition-transform", open && "rotate-180")}
        />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] overflow-hidden rounded-xl border border-glass-border bg-cream shadow-lg dark:bg-[#1E1916]"
            style={{
              left: position.left,
              width: position.width,
              ...(position.dropUp
                ? { bottom: window.innerHeight - position.top + 4 }
                : { top: position.top + 4 }),
            }}
          >
            {showSearch && (
              <div className="px-2 pb-1 pt-2">
                <div className="relative">
                  <Search
                    size={13}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="w-full rounded-lg border border-cream-3/60 bg-cream-3/30 py-1.5 pl-7 pr-3 text-[14.5px] text-text-primary outline-none transition-colors focus:border-coffee"
                  />
                </div>
              </div>
            )}
            <div className="max-h-[220px] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-center text-[14px] text-text-tertiary">No results</p>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    // Trigger selection directly on mousedown (after
                    // preventDefault to keep focus on the trigger). Inside a
                    // Radix Dialog with FocusScope active, the
                    // mousedown→mouseup→click sequence is unreliable on
                    // portaled options. Firing on mousedown bypasses
                    // click-event generation entirely; setOpen(false)
                    // unmounts the portal before a stray click can
                    // double-fire. onClick stays as the keyboard
                    // (Enter/Space) fallback.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(option.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 border-none px-3 py-2 text-left text-[15px] transition-colors",
                      option.value === value
                        ? "bg-coffee/10 font-medium text-coffee"
                        : "bg-transparent text-text-primary hover:bg-cream-3/40",
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2">{option.label}</span>
                    {option.value === value && (
                      <Check size={13} className="flex-shrink-0 text-coffee" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
