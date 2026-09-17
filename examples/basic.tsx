import { useRef, useState } from "react";
import { useDismiss } from "../src/index.js";

export function Dropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, () => setOpen(false));
  return (
    <div ref={ref}>
      <button onClick={() => setOpen((v) => !v)}>Menu</button>
      {open && <div>Dropdown content</div>}
    </div>
  );
}

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, () => setOpen(false));
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open modal</button>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div ref={ref} style={{ background: "white", padding: 24 }}>
            <p>Press Escape or click outside to close.</p>
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function EscapeOnly() {
  const [open, setOpen] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, () => setOpen(false), { outside: false });
  if (!open) return <p>Dismissed via Escape. Refresh to reset.</p>;
  return (
    <div ref={ref} style={{ border: "1px solid #ccc", padding: 12 }}>
      Press Escape to dismiss (outside clicks ignored).
    </div>
  );
}
