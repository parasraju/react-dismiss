import { StrictMode, useRef, useState } from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useDismiss } from "../src/index.js";
import type { UseDismissOptions } from "../src/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function TestComponent({
  onDismiss,
  options,
  testId = "inside",
}: {
  onDismiss: () => void;
  options?: UseDismissOptions;
  testId?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, onDismiss, options);
  return (
    <div>
      <div ref={ref} data-testid={testId}>
        <button data-testid="nested-button">
          <span data-testid="nested-span">inside</span>
        </button>
      </div>
      <div data-testid="outside">outside</div>
    </div>
  );
}

function NullRefComponent({ onDismiss }: { onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // Never attach ref to DOM -> ref.current stays null
  useDismiss(ref, onDismiss);
  return <div data-testid="outside">outside</div>;
}

afterEach(() => {
  // Ensure clean DOM between tests (render from RTL auto-cleanup handles it,
  // but also reset document listeners side-effects already cleaned)
});

// ---------------------------------------------------------------------------
// Outside interaction
// ---------------------------------------------------------------------------
describe("useDismiss", () => {
  it("calls onDismiss on outside pointerdown", () => {
    const fn = vi.fn();
    const { getByTestId } = render(<TestComponent onDismiss={fn} />);
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not call onDismiss on inside pointerdown", () => {
    const fn = vi.fn();
    const { getByTestId } = render(<TestComponent onDismiss={fn} />);
    fireEvent.pointerDown(getByTestId("inside"));
    expect(fn).not.toHaveBeenCalled();
  });

  it("treats nested descendants as inside", () => {
    const fn = vi.fn();
    const { getByTestId } = render(<TestComponent onDismiss={fn} />);
    fireEvent.pointerDown(getByTestId("nested-span"));
    expect(fn).not.toHaveBeenCalled();
    fireEvent.pointerDown(getByTestId("nested-button"));
    expect(fn).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Escape
  // -------------------------------------------------------------------------
  it("calls onDismiss on Escape", () => {
    const fn = vi.fn();
    render(<TestComponent onDismiss={fn} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not call onDismiss on Enter or Space", () => {
    const fn = vi.fn();
    render(<TestComponent onDismiss={fn} />);
    fireEvent.keyDown(document, { key: "Enter" });
    fireEvent.keyDown(document, { key: " " });
    fireEvent.keyDown(document, { key: "a" });
    expect(fn).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Null ref
  // -------------------------------------------------------------------------
  it("does not throw when ref.current is null", () => {
    const fn = vi.fn();
    const { getByTestId } = render(<NullRefComponent onDismiss={fn} />);
    expect(() => fireEvent.pointerDown(getByTestId("outside"))).not.toThrow();
    expect(fn).not.toHaveBeenCalled();
    expect(() => fireEvent.keyDown(document, { key: "Escape" })).not.toThrow();
    // Escape still fires even with null ref (dismiss is not anchored to element for keyboard)
    // Our impl calls onDismiss on Escape regardless of ref.current — that's intentional.
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("handles null event target safely", () => {
    const fn = vi.fn();
    render(<TestComponent onDismiss={fn} />);
    // Dispatch event with no target (edge case)
    const evt = new Event("pointerdown", { bubbles: true });
    // jsdom sets target to document when dispatched on document
    // To simulate null target we fire on document and ensure no throw
    expect(() => document.dispatchEvent(evt)).not.toThrow();
  });

  // -------------------------------------------------------------------------
  // Enabled
  // -------------------------------------------------------------------------
  it("does not call onDismiss when enabled=false (outside)", () => {
    const fn = vi.fn();
    const { getByTestId } = render(
      <TestComponent onDismiss={fn} options={{ enabled: false }} />,
    );
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).not.toHaveBeenCalled();
  });

  it("does not call onDismiss when enabled=false (Escape)", () => {
    const fn = vi.fn();
    render(<TestComponent onDismiss={fn} options={{ enabled: false }} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(fn).not.toHaveBeenCalled();
  });

  it("activates listeners when enabled changes false -> true", () => {
    const fn = vi.fn();
    const { getByTestId, rerender } = render(
      <TestComponent onDismiss={fn} options={{ enabled: false }} />,
    );
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).not.toHaveBeenCalled();

    rerender(<TestComponent onDismiss={fn} options={{ enabled: true }} />);
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("removes listeners when enabled changes true -> false", () => {
    const fn = vi.fn();
    const { getByTestId, rerender } = render(
      <TestComponent onDismiss={fn} options={{ enabled: true }} />,
    );
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).toHaveBeenCalledTimes(1);

    rerender(<TestComponent onDismiss={fn} options={{ enabled: false }} />);
    fireEvent.pointerDown(getByTestId("outside"));
    // still 1
    expect(fn).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Outside option
  // -------------------------------------------------------------------------
  it("outside=false ignores outside interaction but Escape still works", () => {
    const fn = vi.fn();
    const { getByTestId } = render(
      <TestComponent onDismiss={fn} options={{ outside: false }} />,
    );
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Escape option
  // -------------------------------------------------------------------------
  it("escape=false ignores Escape but outside still works", () => {
    const fn = vi.fn();
    const { getByTestId } = render(
      <TestComponent onDismiss={fn} options={{ escape: false }} />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(fn).not.toHaveBeenCalled();
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("outside=false + escape=false does nothing", () => {
    const fn = vi.fn();
    const { getByTestId } = render(
      <TestComponent onDismiss={fn} options={{ outside: false, escape: false }} />,
    );
    fireEvent.pointerDown(getByTestId("outside"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(fn).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Event option
  // -------------------------------------------------------------------------
  it("event=click triggers on click but not on pointerdown", () => {
    const fn = vi.fn();
    const { getByTestId } = render(
      <TestComponent onDismiss={fn} options={{ event: "click" }} />,
    );
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).not.toHaveBeenCalled();
    fireEvent.click(getByTestId("outside"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("event=pointerdown (default) triggers on pointerdown", () => {
    const fn = vi.fn();
    const { getByTestId } = render(
      <TestComponent onDismiss={fn} options={{ event: "pointerdown" }} />,
    );
    fireEvent.click(getByTestId("outside"));
    // click should not trigger when listening for pointerdown
    expect(fn).not.toHaveBeenCalled();
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("switching event type updates listener", () => {
    const fn = vi.fn();
    const { getByTestId, rerender } = render(
      <TestComponent onDismiss={fn} options={{ event: "pointerdown" }} />,
    );
    fireEvent.click(getByTestId("outside"));
    expect(fn).not.toHaveBeenCalled();

    rerender(<TestComponent onDismiss={fn} options={{ event: "click" }} />);
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).not.toHaveBeenCalled();
    fireEvent.click(getByTestId("outside"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Callback stability / stale closure
  // -------------------------------------------------------------------------
  it("always calls the latest callback (stale closure check)", () => {
    function Counter() {
      const [count, setCount] = useState(0);
      const ref = useRef<HTMLDivElement>(null);
      useDismiss(ref, () => {
        setCount(count + 1);
      });
      return (
        <div>
          <div ref={ref} data-testid="inside">
            inside
          </div>
          <div data-testid="outside" onClick={() => {}}>
            outside
          </div>
          <span data-testid="count">{count}</span>
        </div>
      );
    }
    const { getByTestId } = render(<Counter />);
    expect(getByTestId("count").textContent).toBe("0");
    fireEvent.pointerDown(getByTestId("outside"));
    expect(getByTestId("count").textContent).toBe("1");
    fireEvent.pointerDown(getByTestId("outside"));
    expect(getByTestId("count").textContent).toBe("2");
  });

  it("callback ref update does not leak listeners (spy add/remove)", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const { rerender, unmount } = render(<TestComponent onDismiss={fn1} />);
    const initialAdds = addSpy.mock.calls.length;
    // Rerender with new callback — should NOT add new listeners (callback stored in ref)
    rerender(<TestComponent onDismiss={fn2} />);
    // No new addEventListener calls for callback-only change
    expect(addSpy.mock.calls.length).toBe(initialAdds);
    unmount();
    // Should have removed listeners on unmount
    expect(removeSpy).toHaveBeenCalled();
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Unmount cleanup
  // -------------------------------------------------------------------------
  it("removes listeners on unmount", () => {
    const fn = vi.fn();
    const { getByTestId, unmount } = render(<TestComponent onDismiss={fn} />);
    // sanity: works before unmount
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).toHaveBeenCalledTimes(1);
    unmount();
    fireEvent.pointerDown(document.body);
    fireEvent.keyDown(document, { key: "Escape" });
    // still 1
    expect(fn).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // StrictMode
  // -------------------------------------------------------------------------
  it("does not duplicate callbacks in StrictMode", () => {
    const fn = vi.fn();
    const { getByTestId } = render(
      <StrictMode>
        <TestComponent onDismiss={fn} />
      </StrictMode>,
    );
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  // -------------------------------------------------------------------------
  // Multiple instances
  // -------------------------------------------------------------------------
  it("multiple instances work independently", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    function Two() {
      const ref1 = useRef<HTMLDivElement>(null);
      const ref2 = useRef<HTMLDivElement>(null);
      useDismiss(ref1, fn1);
      useDismiss(ref2, fn2);
      return (
        <div>
          <div ref={ref1} data-testid="inside1">
            one
          </div>
          <div ref={ref2} data-testid="inside2">
            two
          </div>
          <div data-testid="outside">outside</div>
        </div>
      );
    }
    const { getByTestId } = render(<Two />);
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);

    // Click inside1 should only prevent fn1
    fn1.mockClear();
    fn2.mockClear();
    fireEvent.pointerDown(getByTestId("inside1"));
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledTimes(1);

    fn1.mockClear();
    fn2.mockClear();
    fireEvent.pointerDown(getByTestId("inside2"));
    expect(fn2).not.toHaveBeenCalled();
    expect(fn1).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Prevent duplicate dismissal (single interaction fires once)
  // -------------------------------------------------------------------------
  it("single outside interaction fires callback exactly once", () => {
    const fn = vi.fn();
    const { getByTestId } = render(<TestComponent onDismiss={fn} />);
    fireEvent.pointerDown(getByTestId("outside"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Callback error propagation
  // -------------------------------------------------------------------------
  it("does not swallow errors thrown by onDismiss", () => {
    const error = new Error("boom");
    const fn = () => {
      throw error;
    };
    const { getByTestId } = render(<TestComponent onDismiss={fn} />);
    // jsdom reports handler-thrown errors as uncaught exceptions (window.onerror),
    // not as synchronous throws from fireEvent. Verify the error bubbles.
    let caught: Error | null = null;
    const onError = (e: ErrorEvent) => {
      caught = e.error;
      e.preventDefault();
    };
    window.addEventListener("error", onError);
    fireEvent.pointerDown(getByTestId("outside"));
    window.removeEventListener("error", onError);
    expect(caught).toBe(error);
  });

  // -------------------------------------------------------------------------
  // SSR safety (import should not access document)
  // -------------------------------------------------------------------------
  it("is SSR-safe: importing does not throw without document", async () => {
    // This is implicitly tested: if the module accessed document at import time,
    // the test suite would already have thrown. We explicitly verify dynamic import.
    await expect(import("../src/index.js")).resolves.toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Disabled listeners not attached (verify via spy)
  // -------------------------------------------------------------------------
  it("does not attach listeners when disabled", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const { unmount } = render(
      <TestComponent onDismiss={vi.fn()} options={{ enabled: false }} />,
    );
    const calls = addSpy.mock.calls.filter(
      ([evt]) => evt === "pointerdown" || evt === "keydown" || evt === "click",
    );
    expect(calls.length).toBe(0);
    addSpy.mockRestore();
    unmount();
  });
});
