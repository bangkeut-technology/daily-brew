"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a rapidly-changing value so downstream query keys — and therefore
 * network requests — only change once the value settles. Without this an admin
 * search box fires one request per keystroke: typing a 20-character email hits
 * the API 20 times and the last response is not guaranteed to land last.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
