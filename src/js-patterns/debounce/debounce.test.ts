import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("invokes once on the trailing edge after the wait", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d();
    d();
    d();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("passes the most recent arguments to the trailing call", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d(1);
    d(2);
    d(3);
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith(3);
  });

  it("resets the timer on each call", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d();
    vi.advanceTimersByTime(80);
    d();
    vi.advanceTimersByTime(80);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(20);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("fires immediately with leading: true and not again on trailing for a single call", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100, { leading: true, trailing: true });

    d();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    // Single call: leading already fired, so no trailing invocation.
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("fires on both edges for a burst with leading + trailing", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100, { leading: true, trailing: true });

    d();
    d();
    expect(fn).toHaveBeenCalledTimes(1); // leading
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2); // trailing
  });

  it("cancel() prevents a pending trailing call", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d();
    d.cancel();
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
    expect(d.pending()).toBe(false);
  });

  it("flush() invokes the pending call immediately", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d("x");
    expect(d.pending()).toBe(true);
    d.flush();
    expect(fn).toHaveBeenCalledWith("x");
    expect(d.pending()).toBe(false);
  });

  it("preserves `this` binding", () => {
    const obj = {
      value: 42,
      read(this: { value: number }) {
        received = this.value;
      },
    };
    let received = 0;
    const d = debounce(obj.read, 100);

    d.call(obj);
    vi.advanceTimersByTime(100);
    expect(received).toBe(42);
  });
});
