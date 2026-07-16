import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Autocomplete } from "./Autocomplete";

const FRUITS = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry"];

describe("Autocomplete", () => {
  it("shows no listbox until the user types", () => {
    render(<Autocomplete options={FRUITS} />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters options case-insensitively by substring", async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={FRUITS} />);

    await user.type(screen.getByRole("combobox"), "ap");
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["Apple", "Apricot"]);
  });

  it("navigates with arrow keys and selects with Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Autocomplete options={FRUITS} onSelect={onSelect} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "b"); // Banana, Blueberry, (Apricot has no b) -> Banana, Blueberry
    await user.keyboard("{ArrowDown}"); // active = Banana
    await user.keyboard("{ArrowDown}"); // active = Blueberry
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith("Blueberry");
    expect(input).toHaveValue("Blueberry");
  });

  it("wraps around when navigating past the ends", async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={FRUITS} />);

    await user.type(screen.getByRole("combobox"), "ap"); // Apple, Apricot
    await user.keyboard("{ArrowUp}"); // wraps to last -> Apricot
    expect(screen.getByRole("option", { name: "Apricot" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("selects an option on click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Autocomplete options={FRUITS} onSelect={onSelect} />);

    await user.type(screen.getByRole("combobox"), "cher");
    await user.click(screen.getByRole("option", { name: "Cherry" }));

    expect(onSelect).toHaveBeenCalledWith("Cherry");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes the list on Escape", async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={FRUITS} />);

    await user.type(screen.getByRole("combobox"), "ap");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("reflects expanded state via aria-expanded", async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={FRUITS} />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.type(input, "ap");
    expect(input).toHaveAttribute("aria-expanded", "true");
  });
});
