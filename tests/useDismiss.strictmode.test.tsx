import { StrictMode, useRef } from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useDismiss } from "../src/index.js";

function Harness({ onDismiss }: { onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, onDismiss);
  return (
    <div>
      <div ref={ref} data-testid="inside">
        inside
      </div>
      <div data-testid="outside">outside</div>
    </div>
  );
}

function handlers(spy: { mock: { calls: unknown[][] } }, type: string): unknown[] {
  return spy.mock.calls.filter(([event]) => event === type).map(([, handler]) => handler);
}

describe("useDismiss StrictMode listener lifecycle", () => {
  it("registers listeners once per mount and removes them on unmount and remount", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const onDismiss = vi.fn();

    const mounted = render(
      <StrictMode>
        <Harness onDismiss={onDismiss} />
      </StrictMode>,
    );

    // StrictMode runs the effect, cleans it up, then runs it again.
    // The first registration is removed; one pointerdown and one keydown remain.
    const addedPointer = handlers(addSpy, "pointerdown");
    const removedPointer = handlers(removeSpy, "pointerdown");
    const addedKey = handlers(addSpy, "keydown");
    const removedKey = handlers(removeSpy, "keydown");
    expect(addedPointer).toHaveLength(2);
    expect(removedPointer).toEqual([addedPointer[0]]);
    expect(addedKey).toHaveLength(2);
    expect(removedKey).toEqual([addedKey[0]]);

    fireEvent.pointerDown(mounted.getByTestId("outside"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledTimes(2);

    mounted.unmount();

    expect(handlers(removeSpy, "pointerdown")).toEqual(addedPointer);
    expect(handlers(removeSpy, "keydown")).toEqual(addedKey);

    onDismiss.mockClear();
    fireEvent.pointerDown(document.body);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).not.toHaveBeenCalled();

    addSpy.mockClear();
    removeSpy.mockClear();

    const remounted = render(
      <StrictMode>
        <Harness onDismiss={onDismiss} />
      </StrictMode>,
    );

    const remountedPointer = handlers(addSpy, "pointerdown");
    const remountedKey = handlers(addSpy, "keydown");
    expect(remountedPointer).toHaveLength(2);
    expect(handlers(removeSpy, "pointerdown")).toEqual([remountedPointer[0]]);
    expect(remountedKey).toHaveLength(2);
    expect(handlers(removeSpy, "keydown")).toEqual([remountedKey[0]]);

    fireEvent.pointerDown(remounted.getByTestId("outside"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledTimes(2);

    remounted.unmount();

    expect(handlers(removeSpy, "pointerdown")).toEqual(remountedPointer);
    expect(handlers(removeSpy, "keydown")).toEqual(remountedKey);

    onDismiss.mockClear();
    fireEvent.pointerDown(document.body);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).not.toHaveBeenCalled();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
