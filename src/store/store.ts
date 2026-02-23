import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, { type ImmigrationState } from "./immigrationSlice";

export const STORAGE_KEY = "immigration-checker-state";

function isImmigrationState(value: unknown): value is ImmigrationState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.prStartDate === "string" &&
    typeof obj.tmpStartDate === "string" &&
    Array.isArray(obj.absences)
  );
}

export function loadPersistedState():
  | { immigration: ImmigrationState }
  | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (isImmigrationState(parsed)) {
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
