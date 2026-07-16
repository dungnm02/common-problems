import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabList, Tab, TabPanel } from "./Tabs";

function Example(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
  return (
    <Tabs defaultValue="a" {...props}>
      <TabList>
        <Tab value="a">First</Tab>
        <Tab value="b">Second</Tab>
      </TabList>
      <TabPanel value="a">Panel A</TabPanel>
      <TabPanel value="b">Panel B</TabPanel>
    </Tabs>
  );
}

describe("compound Tabs", () => {
  it("shows only the default panel initially", () => {
    render(<Example />);
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();
  });

  it("switches panels on tab click", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("tab", { name: "Second" }));

    expect(screen.getByText("Panel B")).toBeInTheDocument();
    expect(screen.queryByText("Panel A")).not.toBeInTheDocument();
  });

  it("wires up aria-selected on the active tab", async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(screen.getByRole("tab", { name: "First" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.click(screen.getByRole("tab", { name: "Second" }));
    expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("links each tab to its panel via aria-controls / aria-labelledby", () => {
    render(<Example />);
    const tab = screen.getByRole("tab", { name: "First" });
    const panel = screen.getByRole("tabpanel");
    expect(tab.getAttribute("aria-controls")).toBe(panel.getAttribute("id"));
    expect(panel.getAttribute("aria-labelledby")).toBe(tab.getAttribute("id"));
  });

  it("supports controlled usage via value + onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Example value="a" onChange={onChange} />);

    await user.click(screen.getByRole("tab", { name: "Second" }));
    // Controlled: parent owns state, so panel does not change on its own...
    expect(onChange).toHaveBeenCalledWith("b");
    expect(screen.getByText("Panel A")).toBeInTheDocument();
  });

  it("throws a helpful error when a Tab is rendered outside Tabs", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Tab value="x">Orphan</Tab>)).toThrow(
      /must be rendered inside <Tabs>/,
    );
    spy.mockRestore();
  });
});
