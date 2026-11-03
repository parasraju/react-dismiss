# react-dismiss

A tiny React hook for dismissing UI when users interact outside or press Escape.

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
  ref: React.RefObject<T | null>,
  onDismiss: () => void,
  options?: UseDismissOptions
): void
```

### Arguments

- `ref`: `React.RefObject<T | null>` — React ref attached to the element considered "inside".
- `onDismiss`: `() => void` — Callback invoked when dismissal triggers. Ref-stable internally so inline callbacks do not re-bind listeners.
- `options`: `UseDismissOptions` (optional object):
  - `enabled` (`boolean`, default: `true`): Master toggle to enable or disable dismissal listeners.
  - `outside` (`boolean`, default: `true`): Whether outside pointer/click interactions trigger dismissal.
  - `escape` (`boolean`, default: `true`): Whether pressing the `Escape` key triggers dismissal.
  - `event` (`"pointerdown" | "click"`, default: `"pointerdown"`): DOM event used for outside interaction detection.

### Returns

`void`

## What It Handles

- Outside interactions (`pointerdown` or `click`) while ignoring clicks on descendants inside `ref`.
- Escape key presses (`keydown` where `event.key === "Escape"`).
- Null or unmounted refs without throwing errors.
- Automatic event listener cleanup on component unmount or when options change.
- SSR safe: guards document access and attaches listeners only inside client-side `useEffect`.

## TypeScript

Ships with built-in TypeScript declarations and generics (`dist/index.d.ts`), no extra `@types` packages required.

## Why This One

- **Zero dependencies**: Only requires `react` (>= 18) as a peer dependency.
- **Tiny footprint**: ~1.3 KB uncompressed ESM/CJS build (< 1 KB minified + gzipped).
- **Ref-stable callback**: Passing inline callback functions will not re-bind document listeners on re-render.

## Links

- **npm**: [npmjs.com/package/react-dismiss](https://www.npmjs.com/package/react-dismiss)
- **GitHub**: [github.com/parasraju/react-dismiss](https://github.com/parasraju/react-dismiss)
