import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../../src/components/ThemeToggle";

const mockSetTheme = vi.fn();
let currentTheme: "light" | "dark" | "system" = "light";

vi.mock("../../src/hooks/useTheme", () => ({
  useTheme: () => ({ theme: currentTheme, setTheme: mockSetTheme }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  currentTheme = "light";
});

describe("ThemeToggle", () => {
  it("renders with light theme label", () => {
    currentTheme = "light";
    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: /Theme: Light/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Light")).toBeInTheDocument();
  });

  it("renders with dark theme label", () => {
    currentTheme = "dark";
    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: /Theme: Dark/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("renders with system theme label", () => {
    currentTheme = "system";
    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: /Theme: System/i })
    ).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("cycles from light to dark on click", async () => {
    currentTheme = "light";
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: /Theme: Light/i }));

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("cycles from dark to system on click", async () => {
    currentTheme = "dark";
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: /Theme: Dark/i }));

    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("cycles from system to light on click", async () => {
    currentTheme = "system";
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: /Theme: System/i }));

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
