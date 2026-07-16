import {
  createContext,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Compound component pattern: <Tabs> shares state with its children
 * (<TabList>/<Tab>/<TabPanel>) implicitly through context, so consumers get a
 * clean declarative API without prop-drilling the active index around.
 */

interface TabsContextValue {
  activeValue: string;
  setActiveValue: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  }
  return ctx;
}

export interface TabsProps {
  /** Controlled active tab value. */
  value?: string;
  /** Default active tab value for uncontrolled usage. */
  defaultValue: string;
  onChange?: (value: string) => void;
  children: ReactNode;
}

export function Tabs({ value, defaultValue, onChange, children }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const baseId = useId();
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internal;

  const setActiveValue = (next: string) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const ctx = useMemo<TabsContextValue>(
    () => ({ activeValue, setActiveValue, baseId }),
    // setActiveValue closes over stable setters; activeValue/baseId drive it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeValue, baseId],
  );

  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

export function TabList({ children }: { children: ReactNode }) {
  return (
    <div role="tablist" style={{ display: "flex", gap: 8 }}>
      {children}
    </div>
  );
}

export interface TabProps {
  value: string;
  children: ReactNode;
}

export function Tab({ value, children }: TabProps) {
  const { activeValue, setActiveValue, baseId } = useTabsContext("Tab");
  const selected = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => setActiveValue(value)}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps {
  value: string;
  children: ReactNode;
}

export function TabPanel({ value, children }: TabPanelProps) {
  const { activeValue, baseId } = useTabsContext("TabPanel");
  if (activeValue !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
    >
      {children}
    </div>
  );
}
