import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer from "./immigrationSlice";

export const STORAGE_KEY = "immigration-checker-state";

export function loadPersistedState(): { immigration?: unknown } | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return { immigration: parsed };
    }
  } catch {
    // Corrupted data — start fresh
  }
  return undefined;
}

export const store = configureStore({
  reducer: {
    immigration: immigrationReducer,
  },
  preloadedState: loadPersistedState(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

type AppStore = typeof store;

export function setupPersistence(targetStore: AppStore) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  return targetStore.subscribe(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try {
        const { immigration } = targetStore.getState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(immigration));
      } catch {
        // localStorage full or unavailable — silently degrade
      }
    }, 300);
  });
}

setupPersistence(store);
