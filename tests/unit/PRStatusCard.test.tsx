import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  setPrStartDate,
  setTmpStartDate,
} from "../../src/store/immigrationSlice";
import { PRStatusCard } from "../../src/components/PRStatusCard";

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
        <PRStatusCard />
      </Provider>
    ),
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("PRStatusCard", () => {
  it("renders with real selector from store inputs", () => {
    const store = createTestStore();
    store.dispatch(setPrStartDate("2022-01-01"));
    store.dispatch(setTmpStartDate("2020-01-01"));
    renderWithStore(store);

    expect(screen.getByText("PR Status")).toBeInTheDocument();
  });

  it("renders 'Secure' badge when status is safe", () => {
    vi.spyOn(selectors, "selectPrStatusCalculation").mockReturnValue({
      status: "safe",
      lossDate: null,
    });
    renderWithStore();

    expect(screen.getByText("Secure")).toBeInTheDocument();
    expect(screen.getByText("PR status is secure")).toBeInTheDocument();
  });

  it("renders 'At Risk' badge with loss date when status is danger", () => {
    vi.spyOn(selectors, "selectPrStatusCalculation").mockReturnValue({
      status: "danger",
      lossDate: new Date("2026-12-01"),
    });
    renderWithStore();

    expect(screen.getByText("At Risk")).toBeInTheDocument();
    expect(screen.getByText(/PR status in danger/)).toBeInTheDocument();
  });

  it("shows 'unknown' when danger status has no loss date", () => {
    vi.spyOn(selectors, "selectPrStatusCalculation").mockReturnValue({
      status: "danger",
      lossDate: null,
    });
    renderWithStore();

    expect(screen.getByText(/unknown/)).toBeInTheDocument();
  });
});
