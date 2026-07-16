import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

/**
 * Accessible Autocomplete (combobox) — a staple UI-component interview build.
 *
 * Covers the parts people usually miss: keyboard navigation (Up/Down/Enter/
 * Escape), an aria-activedescendant that keeps focus on the input, closing on
 * blur/select, and case-insensitive substring filtering.
 */

export interface AutocompleteProps {
  options: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  /** Max number of suggestions to render. Default: 10. */
  maxResults?: number;
}

export function Autocomplete({
  options,
  value,
  defaultValue = "",
  onChange,
  onSelect,
  placeholder,
  maxResults = 10,
}: AutocompleteProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const query = isControlled ? value : internal;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as string[];
    return options
      .filter((opt) => opt.toLowerCase().includes(q))
      .slice(0, maxResults);
  }, [options, query, maxResults]);

  const setQuery = (next: string) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const commit = (option: string) => {
    setQuery(option);
    onSelect?.(option);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onInput = (next: string) => {
    setQuery(next);
    setOpen(true);
    setActiveIndex(-1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return;
      setActiveIndex((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0 && activeIndex < matches.length) {
        e.preventDefault();
        commit(matches[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showList = open && matches.length > 0;

  return (
    <div style={{ position: "relative", width: 280 }}>
      <input
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined
        }
        value={query}
        placeholder={placeholder}
        onChange={(e) => onInput(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => query.trim() && setOpen(true)}
        onBlur={() => {
          // Delay so a mousedown on an option can commit before we close.
          blurTimer.current = setTimeout(() => setOpen(false), 0);
        }}
      />
      {showList && (
        <ul
          role="listbox"
          id={listboxId}
          style={{ listStyle: "none", margin: 0, padding: 0 }}
        >
          {matches.map((option, index) => (
            <li
              key={option}
              id={`${baseId}-opt-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              // onMouseDown fires before the input's onBlur, so we can commit.
              onMouseDown={(e) => {
                e.preventDefault();
                if (blurTimer.current) clearTimeout(blurTimer.current);
                commit(option);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
