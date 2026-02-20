import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer from "./immigrationSlice";

export const store = configureStore({
  reducer: {
    immigration: immigrationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
