import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "../../src/hooks/useTheme";

let matchMediaListeners: Array<() => void> = [];
let systemDark = false;

const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: query === "(prefers-color-scheme: dark)" && systemDark,
  media: query,
  addEventListener: (_event: string, handler: () => void) => {
    matchMediaListeners.push(handler);
  },
  removeEventListener: (_event: string, handler: () => void) => {
    matchMediaListeners = matchMediaListeners.filter((h) => h !== handler);
  },
}));

const storage = new Map<string, string>();
const mockLocalStorage = {
  getItem: vi.fn((key: string) => storage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
  removeItem: vi.fn((key: string) => storage.delete(key)),
  clear: vi.fn(() => storage.clear()),
  get length() {
    return storage.size;
  },
  key: vi.fn(() => null),
};

beforeEach(() => {
  systemDark = false;
  matchMediaListeners = [];
  storage.clear();
  document.documentElement.classList.remove("dark");
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: mockMatchMedia,
  });
  Object.defineProperty(window, "localStorage", {
    writable: true,
    value: mockLocalStorage,
  });
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useTheme", () => {
  it("defaults to system when no stored theme", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
  });

  it("reads stored theme from localStorage", () => {
    storage.set("theme", "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("applies dark class when theme is dark", () => {
    storage.set("theme", "dark");
    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class when theme is light", () => {
    document.documentElement.classList.add("dark");
    storage.set("theme", "light");
    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("setTheme updates theme and persists to localStorage", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("applies system theme based on matchMedia", () => {
    systemDark = true;
    storage.set("theme", "system");
    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("listens for system theme changes when theme is system", () => {
    storage.set("theme", "system");
    renderHook(() => useTheme());
    expect(matchMediaListeners.length).toBeGreaterThan(0);
  });

  it("does not listen for system changes when theme is not system", () => {
    storage.set("theme", "dark");
    renderHook(() => useTheme());
    expect(matchMediaListeners).toHaveLength(0);
  });

  it("cleans up listener on unmount", () => {
    storage.set("theme", "system");
    const { unmount } = renderHook(() => useTheme());
    const listenerCount = matchMediaListeners.length;
    expect(listenerCount).toBeGreaterThan(0);

    unmount();
    expect(matchMediaListeners).toHaveLength(0);
  });
});
