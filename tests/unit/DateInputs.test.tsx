import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer from "../../src/store/immigrationSlice";
import { DateInputs } from "../../src/components/DateInputs";

function createTestStore() {
  return configureStore({
    reducer: { immigration: immigrationReducer },
  });
}

function renderWithStore(store = createTestStore()) {
  return {
    store,
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <DateInputs />
      </Provider>
    ),
  };
}

describe("DateInputs", () => {
  it("renders both date fields", () => {
    renderWithStore();

    expect(screen.getByLabelText("PR Start Date")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Temporary Status Start Date")
    ).toBeInTheDocument();
  });

  it("displays current store values as defaults", () => {
    const store = createTestStore();
    const state = store.getState().immigration;

    renderWithStore(store);

    const prInput = screen.getByLabelText("PR Start Date");
    const tmpInput = screen.getByLabelText("Temporary Status Start Date");

    expect(prInput).toHaveValue(state.prStartDate);
    expect(tmpInput).toHaveValue(state.tmpStartDate);
  });

  it("dispatches setPrStartDate on PR date change", async () => {
    const { store, user } = renderWithStore();

    const prInput = screen.getByLabelText("PR Start Date");
    await user.clear(prInput);
    await user.type(prInput, "2023-10-30");

    expect(store.getState().immigration.prStartDate).toBe("2023-10-30");
  });

  it("dispatches setTmpStartDate on temp date change", async () => {
    const { store, user } = renderWithStore();

    const tmpInput = screen.getByLabelText("Temporary Status Start Date");
    await user.clear(tmpInput);
    await user.type(tmpInput, "2019-12-02");

    expect(store.getState().immigration.tmpStartDate).toBe("2019-12-02");
  });
});
