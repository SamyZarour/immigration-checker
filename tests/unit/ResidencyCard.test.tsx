import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  setPrStartDate,
  setTmpStartDate,
} from "../../src/store/immigrationSlice";
import { ResidencyCard } from "../../src/components/ResidencyCard";

vi.mock("../../src/store/selectors", async () => {
  const actual = await vi.importActual("../../src/store/selectors");
  return { ...actual };
});

import * as selectors from "../../src/store/selectors";

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

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ResidencyCard", () => {
  it("renders with real selector from store inputs", () => {
    const store = createTestStore();
    store.dispatch(setPrStartDate("2022-01-01"));
    store.dispatch(setTmpStartDate("2020-01-01"));
    renderWithStore(store);

    expect(screen.getByText("Residency Obligation")).toBeInTheDocument();
  });

  it("renders 'Maintained' badge when status is safe", () => {
    vi.spyOn(selectors, "selectResidencyCalculation").mockReturnValue({
      status: "safe",
      lossDate: null,
    });
    renderWithStore();

    expect(screen.getByText("Maintained")).toBeInTheDocument();
    expect(screen.getByText("Residency status maintained")).toBeInTheDocument();
  });

  it("renders 'At Risk' badge with deadline when status is danger", () => {
    vi.spyOn(selectors, "selectResidencyCalculation").mockReturnValue({
      status: "danger",
      lossDate: 2025,
    });
    renderWithStore();

    expect(screen.getByText("At Risk")).toBeInTheDocument();
    expect(
      screen.getByText(/Residency status in danger — deadline is 2025/)
    ).toBeInTheDocument();
  });
});
