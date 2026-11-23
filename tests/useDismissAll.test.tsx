import { StrictMode, useRef } from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useDismiss, useDismissAll } from "../src/index.js";

function DismissAllButton() {
  const dismissAll = useDismissAll();
  return (
    <button type="button" onClick={() => dismissAll()}>
      dismiss all popovers
    </button>
  );
}

function Popover({
  onDismiss,
  enabled = true,
  testId,
}: {
  onDismiss: () => void;
  enabled?: boolean;
  testId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, onDismiss, { enabled });
  return <div ref={ref} data-testid={testId} />;
}

describe("useDismissAll", () => {
  it("calls onDismiss once per mounted instance, once per dismissAll call", () => {
    const onMenu = vi.fn();
    const onPicker = vi.fn();
    const { getByRole } = render(
      <>
        <DismissAllButton />
        <Popover onDismiss={onMenu} testId="menu" />
        <Popover onDismiss={onPicker} testId="picker" />
      </>,
    );

    fireEvent.click(getByRole("button"));
    expect(onMenu).toHaveBeenCalledTimes(1);
    expect(onPicker).toHaveBeenCalledTimes(1);

    fireEvent.click(getByRole("button"));
    expect(onMenu).toHaveBeenCalledTimes(2);
    expect(onPicker).toHaveBeenCalledTimes(2);
  });

  it("does nothing when zero instances are mounted", () => {
    const onDismiss = vi.fn();
    const empty = render(<DismissAllButton />);
    expect(() => fireEvent.click(empty.getByRole("button"))).not.toThrow();
    empty.unmount();

    const mounted = render(
      <>
        <DismissAllButton />
        <Popover onDismiss={onDismiss} testId="menu" />
      </>,
    );
    mounted.rerender(<DismissAllButton />);
    expect(() => fireEvent.click(mounted.getByRole("button"))).not.toThrow();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("calls the latest onDismiss and returns a stable function", () => {
    const first = vi.fn();
    const second = vi.fn();
    const seen: Array<() => void> = [];

    function Page({ onDismiss }: { onDismiss: () => void }) {
      const dismissAll = useDismissAll();
      seen.push(dismissAll);
      return (
        <>
          <button type="button" onClick={() => dismissAll()}>
            dismiss all popovers
          </button>
          <Popover onDismiss={onDismiss} testId="menu" />
        </>
      );
    }

    const view = render(<Page onDismiss={first} />);
    view.rerender(<Page onDismiss={second} />);
    fireEvent.click(view.getByRole("button"));
    expect(seen.length).toBeGreaterThan(1);
    expect(seen[0]).toBe(seen[seen.length - 1]);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("does not dismiss a disabled instance", () => {
    const onEnabled = vi.fn();
    const onDisabled = vi.fn();
    const { getByRole } = render(
      <>
        <DismissAllButton />
        <Popover onDismiss={onEnabled} testId="enabled" enabled />
        <Popover onDismiss={onDisabled} testId="disabled" enabled={false} />
      </>,
    );

    fireEvent.click(getByRole("button"));
    expect(onEnabled).toHaveBeenCalledTimes(1);
    expect(onDisabled).not.toHaveBeenCalled();
  });

  it("follows enabled when it changes", () => {
    const onDismiss = vi.fn();
    function Page({ enabled }: { enabled: boolean }) {
      return (
        <>
          <DismissAllButton />
          <Popover onDismiss={onDismiss} testId="menu" enabled={enabled} />
        </>
      );
    }

    const view = render(<Page enabled={false} />);
    fireEvent.click(view.getByRole("button"));
    expect(onDismiss).not.toHaveBeenCalled();

    view.rerender(<Page enabled />);
    fireEvent.click(view.getByRole("button"));
    expect(onDismiss).toHaveBeenCalledTimes(1);

    view.rerender(<Page enabled={false} />);
    fireEvent.click(view.getByRole("button"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses an enabled instance that listens for neither outside click nor Escape", () => {
    const onDismiss = vi.fn();
    function QuietPopover() {
      const ref = useRef<HTMLDivElement>(null);
      useDismiss(ref, onDismiss, { outside: false, escape: false });
      return <div ref={ref} data-testid="quiet" />;
    }

    const { getByRole } = render(
      <>
        <DismissAllButton />
        <QuietPopover />
      </>,
    );

    fireEvent.click(getByRole("button"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("leaves no leaked registrations after a StrictMode remount", () => {
    const onMenu = vi.fn();
    const onPicker = vi.fn();

    function Shell({ show }: { show: boolean }) {
      return (
        <StrictMode>
          <DismissAllButton />
          {show ? (
            <>
              <Popover onDismiss={onMenu} testId="menu" />
              <Popover onDismiss={onPicker} testId="picker" />
            </>
          ) : null}
        </StrictMode>
      );
    }

    const view = render(<Shell show />);
    fireEvent.click(view.getByRole("button"));
    expect(onMenu).toHaveBeenCalledTimes(1);
    expect(onPicker).toHaveBeenCalledTimes(1);

    onMenu.mockClear();
    onPicker.mockClear();
    view.rerender(<Shell show={false} />);
    fireEvent.click(view.getByRole("button"));
    expect(onMenu).not.toHaveBeenCalled();
    expect(onPicker).not.toHaveBeenCalled();

    view.rerender(<Shell show />);
    fireEvent.click(view.getByRole("button"));
    expect(onMenu).toHaveBeenCalledTimes(1);
    expect(onPicker).toHaveBeenCalledTimes(1);
  });
});
