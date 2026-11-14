# react-dismiss

A tiny React hook for dismissing UI when users interact outside or press Escape.

**[Live Demo on CodeSandbox](https://codesandbox.io/s/xzwc87)**

## Installation

```bash
npm install react-dismiss
```

```bash
pnpm add react-dismiss
```

```bash
yarn add react-dismiss
```

## Quick Start

```tsx
import { useRef, useState } from "react";
import { useDismiss } from "react-dismiss";

export function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useDismiss(menuRef, () => setIsOpen(false));

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setIsOpen((prev) => !prev)}>Toggle Menu</button>
      {isOpen && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "#fff",
            border: "1px solid #ccc",
            padding: "8px",
            listStyle: "none",
          }}
        >
          <li>Profile</li>
          <li>Settings</li>
          <li>Log out</li>
        </ul>
      )}
    </div>
  );
}
```

## API

```ts
useDismiss<T extends HTMLElement>(
  ref: React.RefObject<T | null> | React.RefObject<T | null>[],
  onDismiss: () => void,
  options?: UseDismissOptions
): void
```

### Arguments

- `ref`: `React.RefObject<T | null>` or an array of them — React ref(s) attached to the element(s) considered "inside". Dismissal runs only when the interaction is outside all of them.
- `onDismiss`: `() => void` — Callback invoked when dismissal triggers. Ref-stable internally so inline callbacks do not re-bind listeners.
- `options`: `UseDismissOptions` (optional object):
  - `enabled` (`boolean`, default: `true`): Master toggle to enable or disable dismissal listeners.
  - `outside` (`boolean`, default: `true`): Whether outside pointer/click interactions trigger dismissal.
  - `escape` (`boolean`, default: `true`): Whether pressing the `Escape` key triggers dismissal.
  - `event` (`"pointerdown" | "click"`, default: `"pointerdown"`): DOM event used for outside interaction detection.
  - `ignore` (`React.RefObject<HTMLElement | null>` or an array of them): Refs whose clicks never trigger dismissal, e.g. a toggle button outside the dismissed element.

### Returns

`void`

### Multiple refs — dismiss only outside all of them

The first argument accepts one ref or several. Dismissal runs only when the event is outside all of them. A click inside any ref does not dismiss.

```ts
useDismiss([menuRef, panelRef], () => setIsOpen(false));
```

### Ignore option — clicks on ignored refs never dismiss

`options.ignore` accepts one ref or several. Clicks on ignored refs never dismiss.

```ts
useDismiss(menuRef, () => setIsOpen(false), {
  ignore: toggleRef,
});
```

## What It Handles

- Outside interactions (`pointerdown` or `click`) while ignoring clicks on descendants inside `ref`.
- Multiple refs: dismissal runs only when the interaction is outside all of them.
- Ignore option: clicks on ignored refs never dismiss.
- Escape key presses (`keydown` where `event.key === "Escape"`).
- Null or unmounted refs without throwing errors.
- Automatic event listener cleanup on component unmount or when options change.
- SSR safe: guards document access and attaches listeners only inside client-side `useEffect`.

## TypeScript

Ships with built-in TypeScript declarations and generics (`dist/index.d.ts`), no extra `@types` packages required.

## Why This One

- **Zero dependencies**: Only requires `react` (>= 18) as a peer dependency.
- **Tiny footprint**: ~1.7 KB uncompressed ESM/CJS build (< 1 KB minified + gzipped).
- **Ref-stable callback**: Passing inline callback functions will not re-bind document listeners on re-render.
- One hook, not a hook library — no need to install a whole utilities package for a single outside-click handler.

## react-dismiss vs react-use vs ahooks

Looking for a useClickAway alternative? This click outside hook comparison covers the differences that matter when you only need dismiss behavior. The competitor columns come from each package's own documentation and published metadata, checked on November 14, 2026; the `react-dismiss` column comes from this package's source.

| | react-dismiss | react-use | ahooks |
| --- | --- | --- | --- |
| What you install | One hook (`useDismiss`) | Full hooks library (`useClickAway` is one of many hooks) | Full hooks library (`useClickAway` is one of many hooks) |
| Dependencies | 0 | 14 | 8 |
| Install size (measured build / whole library unpacked) | ~1.7 KB build output (ESM 1.70 KB, CJS 1.73 KB, uncompressed) | ~454 kB whole library | ~630 kB whole library |
| Hook name | `useDismiss` | `useClickAway` | `useClickAway` |
| Multiple refs | Yes — one ref or an array of refs | No — one ref per call | Yes — one target or an array of targets |
| Ignore option | Yes — `ignore` accepts one ref or an array | No | No |
| Escape handling | Yes — `keydown` with `Escape` | No | No |
| Event listened to | `pointerdown` by default; configurable to `click` | `mousedown` and `touchstart` by default; configurable event list | `click` by default; configurable event name(s) |
| SSR guard | Yes — explicit `typeof document === "undefined"` check inside the effect | Client-side `useEffect` only; no explicit guard | Client-side `useEffect` only; no explicit guard |

The `react-dismiss` size is the measured uncompressed build output. The `react-use` and `ahooks` sizes are each package's whole-library unpacked size from the npm registry, not the size of `useClickAway` alone — tree-shaking and bundling determine what you actually ship, so treat those numbers as the scope of the install, not a per-hook cost.

When to pick each one: choose `react-dismiss` when dismiss-on-outside-interaction or Escape is the only behavior you need and you would rather not add a full hook library. Choose `react-use` or `ahooks` when you already use that library for many other hooks and want one dependency for all of them. In this `react-dismiss` vs `react-use` vs `ahooks` comparison, the trade-off is focus versus breadth, not correctness: all three packages detect outside clicks, and `ahooks` also supports multiple targets, just as `react-dismiss` does.

## Links

- **Live Demo**: [codesandbox.io/s/xzwc87](https://codesandbox.io/s/xzwc87)
- **npm**: [npmjs.com/package/react-dismiss](https://www.npmjs.com/package/react-dismiss)
- **GitHub**: [github.com/parasraju/react-dismiss](https://github.com/parasraju/react-dismiss)
