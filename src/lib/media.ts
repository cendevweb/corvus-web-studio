"use client";

import { useSyncExternalStore } from "react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/** Non-reactive check, safe to call inside event handlers and effects. */
export function matches(query: string): boolean {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

export const prefersReducedMotion = () => matches(REDUCED_MOTION_QUERY);

/** Reactive media query (false on the server). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const usePrefersReducedMotion = () => useMediaQuery(REDUCED_MOTION_QUERY);
