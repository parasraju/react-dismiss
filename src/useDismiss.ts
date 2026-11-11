import { useEffect, useRef } from "react";
import type { UseDismissOptions } from "./types.js";

export function useDismiss<T extends HTMLElement>(
  ref:
    | React.RefObject<T | null>
    | React.RefObject<T | null>[],
  onDismiss: () => void,
  options: UseDismissOptions = {},
): void {
  const {
    enabled = true,
    outside = true,
    escape = true,
    event = "pointerdown",
    ignore,
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

    // Normalized inside the effect so the dep array stays honest: callers
    // passing an inline array literal re-bind listeners on re-render, which
    // is correct; stable useRef objects do not.
    const refs = Array.isArray(ref) ? ref : [ref];
    const ignoreRefs =
      ignore === undefined
        ? []
        : Array.isArray(ignore)
          ? ignore
          : [ignore];

    const handleOutside = (e: Event) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      // Only mounted refs count. With no mounted ref, there is no "inside",
      // so nothing to dismiss from (same as the old single null-ref behavior).
      const elements = refs
        .map((r) => r.current)
        .filter((el): el is T => el !== null);
      if (elements.length === 0) return;
      // Inside any ref: not a dismissal.
      if (elements.some((el) => el.contains(target))) return;
      // Inside an ignored ref: never dismiss.
      const ignored = ignoreRefs
        .map((r) => r.current)
        .filter((el): el is HTMLElement => el !== null);
      if (ignored.some((el) => el.contains(target))) return;
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
  }, [ref, ignore, enabled, outside, escape, event]);
}
