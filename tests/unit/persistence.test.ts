import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  setPrStartDate,
  setTmpStartDate,
} from "../../src/store/immigrationSlice";
import {
  STORAGE_KEY,
  loadPersistedState,
  setupPersistence,
} from "../../src/store/store";

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

function createTestStore(
  preloadedState?: ReturnType<typeof loadPersistedState>
) {
  return configureStore({
    reducer: { immigration: immigrationReducer },
    preloadedState,
  });
}

describe("store persistence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    storage.clear();
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      writable: true,
      value: mockLocalStorage,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    storage.clear();
  });

  describe("loadPersistedState", () => {
    it("returns undefined when localStorage is empty", () => {
      expect(loadPersistedState()).toBeUndefined();
    });

    it("loads valid persisted state", () => {
      const saved = {
        prStartDate: "2023-10-30",
        tmpStartDate: "2019-12-02",
        absences: [
          {
            startDate: "2024-06-01",
            endDate: "2024-06-15",
            description: "Vacation",
          },
        ],
      };
      storage.set(STORAGE_KEY, JSON.stringify(saved));

      const result = loadPersistedState();
      expect(result).toEqual({ immigration: saved });
    });

    it("returns undefined for corrupted JSON", () => {
      storage.set(STORAGE_KEY, "not valid json {{{");
      expect(loadPersistedState()).toBeUndefined();
    });

    it("returns undefined for non-object data", () => {
      storage.set(STORAGE_KEY, JSON.stringify("just a string"));
      expect(loadPersistedState()).toBeUndefined();
    });

    it("returns undefined for array data", () => {
      storage.set(STORAGE_KEY, JSON.stringify([1, 2, 3]));
      expect(loadPersistedState()).toBeUndefined();
    });
  });

  describe("setupPersistence", () => {
    it("saves state to localStorage after debounce", () => {
      const store = createTestStore();
      setupPersistence(store);

      store.dispatch(setPrStartDate("2025-01-01"));

      expect(storage.has(STORAGE_KEY)).toBe(false);

      vi.advanceTimersByTime(300);

      const persisted = JSON.parse(storage.get(STORAGE_KEY)!) as Record<
        string,
        unknown
      >;
      expect(persisted.prStartDate).toBe("2025-01-01");
    });

    it("debounces rapid dispatches — only the final state is persisted", () => {
      const store = createTestStore();
      setupPersistence(store);

      store.dispatch(setPrStartDate("2025-01-01"));
      store.dispatch(setTmpStartDate("2020-01-01"));
      store.dispatch(setPrStartDate("2025-06-15"));

      vi.advanceTimersByTime(300);

      const persisted = JSON.parse(storage.get(STORAGE_KEY)!) as Record<
        string,
        unknown
      >;
      expect(persisted.prStartDate).toBe("2025-06-15");
      expect(persisted.tmpStartDate).toBe("2020-01-01");
    });

    it("returns an unsubscribe function", () => {
      const store = createTestStore();
      const unsubscribe = setupPersistence(store);

      store.dispatch(setPrStartDate("2025-01-01"));
      vi.advanceTimersByTime(300);
      expect(storage.has(STORAGE_KEY)).toBe(true);

      storage.clear();
      unsubscribe();

      store.dispatch(setPrStartDate("2026-01-01"));
      vi.advanceTimersByTime(300);
      expect(storage.has(STORAGE_KEY)).toBe(false);
    });
  });

  describe("end-to-end persistence", () => {
    it("state persisted by one store is loaded by a new store", () => {
      const store1 = createTestStore();
      setupPersistence(store1);

      store1.dispatch(setPrStartDate("2023-10-30"));
      store1.dispatch(setTmpStartDate("2019-12-02"));
      vi.advanceTimersByTime(300);

      const store2 = createTestStore(loadPersistedState());
      const state = store2.getState().immigration;
      expect(state.prStartDate).toBe("2023-10-30");
      expect(state.tmpStartDate).toBe("2019-12-02");
    });
  });
});
