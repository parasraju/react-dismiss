import { useEffect, useRef } from "react";
import type { UseDismissOptions } from "./types.js";

export function useDismiss<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onDismiss: () => void,
  options: UseDismissOptions = {},
): void {
  const {
    enabled = true,
    outside = true,
    escape = true,
    event = "pointerdown",
  } = options;

  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!enabled) return;
    if (!outside && !escape) return;

    // SSR guard: document is unavailable on server. Effect only runs on client,
    // but guard keeps logic safe if environment is non-DOM.
    if (typeof document === "undefined") return;

    const handleOutside = (e: Event) => {
      const el = ref.current;
      if (!el) return;
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (el.contains(target)) return;
      onDismissRef.current();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismissRef.current();
      }
    };

    if (outside) {
      document.addEventListener(event, handleOutside);
    }
    if (escape) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (outside) {
        document.removeEventListener(event, handleOutside);
      }
      if (escape) {
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [ref, enabled, outside, escape, event]);
}
