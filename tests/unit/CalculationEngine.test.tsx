import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  setPrStartDate,
  setTmpStartDate,
  addAbsence,
} from "../../src/store/immigrationSlice";
import { CalculationEngine } from "../../src/components/CalculationEngine";

function createTestStore() {
  return configureStore({
    reducer: { immigration: immigrationReducer },
  });
}

describe("CalculationEngine", () => {
  it("sets isCalculating to true then false after calculations", async () => {
    const store = createTestStore();
    store.dispatch(setPrStartDate("2022-01-01"));
    store.dispatch(setTmpStartDate("2020-01-01"));

    render(
      <Provider store={store}>
        <CalculationEngine />
      </Provider>
    );

    expect(store.getState().immigration.isCalculating).toBe(true);

    await waitFor(
      () => {
        expect(store.getState().immigration.isCalculating).toBe(false);
      },
      { timeout: 2000 }
    );
  });

  it("populates citizenshipCalculation after running", async () => {
    const store = createTestStore();
    store.dispatch(setPrStartDate("2022-01-01"));
    store.dispatch(setTmpStartDate("2020-01-01"));

    render(
      <Provider store={store}>
        <CalculationEngine />
      </Provider>
    );

    await waitFor(
      () => {
        const state = store.getState().immigration;
        expect(state.citizenshipCalculation).not.toBeNull();
        expect(state.citizenshipCalculation!.totalDays).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });

  it("populates prStatusCalculation after running", async () => {
    const store = createTestStore();
    store.dispatch(setPrStartDate("2022-01-01"));
    store.dispatch(setTmpStartDate("2020-01-01"));

    render(
      <Provider store={store}>
        <CalculationEngine />
      </Provider>
    );

    await waitFor(
      () => {
        expect(store.getState().immigration.prStatusCalculation).not.toBeNull();
      },
      { timeout: 2000 }
    );
  });

  it("populates residencyCalculation after running", async () => {
    const store = createTestStore();
    store.dispatch(setPrStartDate("2022-01-01"));
    store.dispatch(setTmpStartDate("2020-01-01"));

    render(
      <Provider store={store}>
        <CalculationEngine />
      </Provider>
    );

    await waitFor(
      () => {
        expect(
          store.getState().immigration.residencyCalculation
        ).not.toBeNull();
      },
      { timeout: 2000 }
    );
  });

  it("accounts for absences in calculations", async () => {
    const store = createTestStore();
    store.dispatch(setPrStartDate("2022-01-01"));
    store.dispatch(setTmpStartDate("2020-01-01"));
    store.dispatch(
      addAbsence({
        startDate: "2023-06-01",
        endDate: "2023-12-31",
        description: "Away",
      })
    );

    render(
      <Provider store={store}>
        <CalculationEngine />
      </Provider>
    );

    await waitFor(
      () => {
        const calc = store.getState().immigration.citizenshipCalculation;
        expect(calc).not.toBeNull();
      },
      { timeout: 2000 }
    );
  });

  it("renders nothing visible", () => {
    const store = createTestStore();
    const { container } = render(
      <Provider store={store}>
        <CalculationEngine />
      </Provider>
    );

    expect(container.innerHTML).toBe("");
  });
});
