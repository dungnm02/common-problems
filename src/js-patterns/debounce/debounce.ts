export interface DebounceOptions {
  /** Invoke on the leading edge of the timeout. Default: false. */
  leading?: boolean;
  /** Invoke on the trailing edge of the timeout. Default: true. */
  trailing?: boolean;
}

export interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void;
  /** Cancel any pending trailing invocation. */
  cancel(): void;
  /** Immediately invoke any pending trailing call and reset. */
  flush(): void;
  /** Whether a trailing invocation is currently pending. */
  pending(): boolean;
}

/**
 * Returns a debounced version of `fn` that delays invocation until `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * called. Supports leading/trailing edges plus `cancel`/`flush`/`pending`.
 *
 * A common front-end interview question: the trick is tracking the last
 * arguments/`this` so a trailing call fires with the most recent args.
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => unknown,
  wait: number,
  options: DebounceOptions = {},
): DebouncedFunction<Args> {
  const { leading = false, trailing = true } = options;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;
  let lastThis: unknown;

  function invoke() {
    // Snapshot then clear so a call made from inside `fn` re-arms cleanly.
    const args = lastArgs as Args;
    const thisArg = lastThis;
    lastArgs = null;
    lastThis = undefined;
    fn.apply(thisArg, args);
  }

  const debounced = function (this: unknown, ...args: Args) {
    lastArgs = args;
    lastThis = this;

    const shouldCallLeading = leading && timer === null;

    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      // Only fire on the trailing edge if there are unspent args and we did
      // not already fire on the leading edge for this same burst.
      if (trailing && lastArgs !== null) invoke();
    }, wait);

    if (shouldCallLeading) invoke();
  } as DebouncedFunction<Args>;

  debounced.cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    lastArgs = null;
    lastThis = undefined;
  };

  debounced.flush = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      if (lastArgs !== null) invoke();
    }
  };

  debounced.pending = () => timer !== null;

  return debounced;
}
