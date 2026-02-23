import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  setPrStatusCalculation,
  setIsCalculating,
} from "../../src/store/immigrationSlice";
import { PRStatusCard } from "../../src/components/PRStatusCard";

function createTestStore() {
  return configureStore({
    reducer: { immigration: immigrationReducer },
  });
}

function renderWithStore(store = createTestStore()) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <PRStatusCard />
      </Provider>
    ),
  };
}

describe("PRStatusCard", () => {
  it("renders loading state when calculating", () => {
    const store = createTestStore();
    store.dispatch(setIsCalculating(true));
    renderWithStore(store);

    expect(screen.getByText("Calculating...")).toBeInTheDocument();
    expect(screen.getByText("Calculating")).toBeInTheDocument();
  });

  it("renders pending state when no calculation exists", () => {
    renderWithStore();

    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(
      screen.getByText("Enter your dates to see results")
    ).toBeInTheDocument();
  });

  it("renders 'Secure' badge when status is safe", () => {
    const store = createTestStore();
    store.dispatch(setPrStatusCalculation({ status: "safe", lossDate: null }));
    renderWithStore(store);

    expect(screen.getByText("Secure")).toBeInTheDocument();
    expect(screen.getByText("PR status is secure")).toBeInTheDocument();
  });

  it("renders 'At Risk' badge with loss date when status is danger", () => {
    const store = createTestStore();
    store.dispatch(
      setPrStatusCalculation({ status: "danger", lossDate: "2026-12-01" })
    );
    renderWithStore(store);

    expect(screen.getByText("At Risk")).toBeInTheDocument();
    expect(screen.getByText(/PR status in danger/)).toBeInTheDocument();
  });

  it("shows 'unknown' when danger status has no loss date", () => {
    const store = createTestStore();
    store.dispatch(
      setPrStatusCalculation({ status: "danger", lossDate: null })
    );
    renderWithStore(store);

    expect(screen.getByText(/unknown/)).toBeInTheDocument();
  });
});
