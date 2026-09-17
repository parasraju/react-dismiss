# react-dismiss

A tiny React hook for dismissing UI on outside interaction or Escape.

Tiny, dependency-free, SSR-safe, StrictMode-safe, TypeScript-first. Ideal for dropdowns, popovers, modals, menus, and overlays.

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

Requires `react >= 18` (peer dependency).

## Quick Start

```tsx
import { useRef, useState } from "react";
import { useDismiss } from "react-dismiss";

function Dropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useDismiss(ref, () => {
    setOpen(false);
  });

  return (
    <div ref={ref}>
      <button onClick={() => setOpen((v) => !v)}>Menu</button>
      {open && <div>Dropdown content</div>}
    </div>
  );
}
```

## How It Works

```
Interaction inside element  → ignore
Interaction outside element → onDismiss()
Escape key                 → onDismiss()
```

- Outside detection uses `element.contains(event.target)` — descendants are considered inside. Safe when `ref.current === null`.
- Escape handling listens for `keydown` with `key === "Escape"`.
- Listeners are attached to `document` inside `useEffect` (no SSR side-effects).

## API

```ts
useDismiss(ref, onDismiss, options?)
```

### `ref`

`React.RefObject<T extends HTMLElement>` — the element considered "inside". Attach it to the root of the dismissible UI.

### `onDismiss`

`() => void` — called on dismissal. Latest callback is always used (ref-stable). Errors are not swallowed.

### `options`

| Option    | Type                         | Default         | Description                               |
| --------- | ---------------------------- | --------------- | ----------------------------------------- |
| `enabled` | `boolean`                    | `true`          | Master toggle. `false` removes listeners. |
| `outside` | `boolean`                    | `true`          | Enable outside interaction dismissal.     |
| `escape`  | `boolean`                    | `true`          | Enable Escape key dismissal.              |
| `event`   | `"pointerdown"` \| `"click"` | `"pointerdown"` | DOM event for outside detection.          |

All options are optional and can be toggled dynamically.

## Options

```tsx
// Disabled
useDismiss(ref, close, { enabled: false });

// Escape only
useDismiss(ref, close, { outside: false });

// Outside only
useDismiss(ref, close, { escape: false });

// Use click instead of pointerdown
useDismiss(ref, close, { event: "click" });
```

## Examples

### Dropdown

```tsx
const ref = useRef<HTMLDivElement>(null);
useDismiss(ref, () => setOpen(false));
```

### Modal

```tsx
const ref = useRef<HTMLDivElement>(null);
useDismiss(ref, closeModal);
// Renders inside an overlay; Escape and outside click both close.
```

### Popover

```tsx
const ref = useRef<HTMLDivElement>(null);
useDismiss(ref, () => setPopoverOpen(false));
```

### Search suggestions

```tsx
const ref = useRef<HTMLDivElement>(null);
useDismiss(ref, () => setSuggestions([]));
```

### Escape-only (e.g., controlled modal where backdrop handles clicks)

```tsx
useDismiss(ref, close, { outside: false });
```

### Click event (when pointerdown is too eager)

```tsx
useDismiss(ref, close, { event: "click" });
```

See `examples/basic.tsx` for runnable demos.

## TypeScript

Fully typed, strict `no any`.

```tsx
const divRef = useRef<HTMLDivElement>(null);
useDismiss(divRef, onDismiss); // infers HTMLDivElement

const btnRef = useRef<HTMLButtonElement>(null);
useDismiss(btnRef, onDismiss); // infers HTMLButtonElement
```

## SSR

Safe for Next.js, Remix, Vite SSR, React Router. No browser globals are accessed at import time; listeners are registered inside `useEffect` only on the client.

```tsx
// This import never touches `document` at module init:
import { useDismiss } from "react-dismiss";
```

## Accessibility

> `react-dismiss` provides interaction detection, not complete accessibility behavior.

You still need to handle:

- Focus management / focus trapping for dialogs
- `aria-expanded`, `aria-controls`, correct `role`
- Keyboard navigation (arrow keys, tab order)
- Screen-reader announcements

Escape handling in this hook complements but does not replace those patterns. Pair it with proper ARIA:

```tsx
<button aria-expanded={open} aria-controls="menu">
  Menu
</button>
<div id="menu" role="menu">{/* ... */}</div>
```

## Browser Support

- Outside detection uses `PointerEvent` (`pointerdown`). All modern browsers support it (Chrome 55+, Firefox 59+, Safari 13+).
- Fallback: pass `{ event: "click" }` if you must target older browsers.
- Escape handling uses `keydown` + `key === "Escape"` (universally supported).

## Bundle Size

- ~1.3 KB uncompressed (`dist/index.js`), < 1 KB minified + gzipped.
- Zero runtime dependencies.
- Tree-shakeable (`sideEffects: false`).

## Portals

By default "inside" means descendants of `ref.current` (`element.contains`). Content rendered in a React portal outside that subtree is considered outside and will dismiss. If you need multiple "inside" roots, compose refs or lift the dismiss root to a common ancestor. A dedicated multi-root API is intentionally out of scope for v1.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm run test:run
npm run build
```

## Testing

```bash
npm run test        # watch
npm run test:run    # single run
```

Tests cover outside/inside, Escape, other keys, null ref, enabled/outside/escape toggles, dynamic enable, event switching, stale closures, unmount cleanup, StrictMode, nested elements, multiple instances, and error propagation.

## Building

```bash
npm run build       # tsup → dist/index.js, dist/index.cjs, dist/index.d.ts
npm pack --dry-run  # inspect published contents
```

## Publishing

```bash
npm run check       # typecheck + lint + tests
npm run build
npm pack --dry-run  # verify files: dist/, README.md, LICENSE
npm publish         # or OIDC trusted publishing via GitHub Actions
```

Never commit secrets. If using GitHub Actions publishing, prefer OIDC over long-lived tokens.

## License

MIT — see [LICENSE](./LICENSE).
