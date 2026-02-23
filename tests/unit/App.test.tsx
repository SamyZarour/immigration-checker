import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../../src/App";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  Object.defineProperty(window, "localStorage", {
    writable: true,
    value: {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
      removeItem: vi.fn((key: string) => storage.delete(key)),
      clear: vi.fn(() => storage.clear()),
      get length() {
        return storage.size;
      },
      key: vi.fn(() => null),
    },
  });
});

describe("App", () => {
  it("renders the application heading", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Canadian PR Planner" })
    ).toBeInTheDocument();
  });

  it("renders all three status cards", () => {
    render(<App />);
    expect(screen.getByText("Citizenship Eligibility")).toBeInTheDocument();
    expect(screen.getByText("PR Status")).toBeInTheDocument();
    expect(screen.getByText("Residency Obligation")).toBeInTheDocument();
  });

  it("renders the input sections", () => {
    render(<App />);
    expect(screen.getByText("Important Dates")).toBeInTheDocument();
    expect(screen.getByText("Import / Export")).toBeInTheDocument();
  });

  it("renders the theme toggle", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /Theme:/ })).toBeInTheDocument();
  });

  it("renders the absences section", () => {
    render(<App />);
    expect(screen.getByText("Recorded Absences")).toBeInTheDocument();
  });
});
