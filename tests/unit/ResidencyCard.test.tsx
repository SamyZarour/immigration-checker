import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  setResidencyCalculation,
  setIsCalculating,
} from "../../src/store/immigrationSlice";
import { ResidencyCard } from "../../src/components/ResidencyCard";

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
        <ResidencyCard />
      </Provider>
    ),
  };
}

describe("ResidencyCard", () => {
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

  it("renders 'Maintained' badge when status is safe", () => {
    const store = createTestStore();
    store.dispatch(setResidencyCalculation({ status: "safe", lossDate: null }));
    renderWithStore(store);

    expect(screen.getByText("Maintained")).toBeInTheDocument();
    expect(screen.getByText("Residency status maintained")).toBeInTheDocument();
  });

  it("renders 'At Risk' badge with deadline when status is danger", () => {
    const store = createTestStore();
    store.dispatch(
      setResidencyCalculation({ status: "danger", lossDate: 180 })
    );
    renderWithStore(store);

    expect(screen.getByText("At Risk")).toBeInTheDocument();
    expect(
      screen.getByText(/Residency status in danger — deadline is 180/)
    ).toBeInTheDocument();
  });
});
