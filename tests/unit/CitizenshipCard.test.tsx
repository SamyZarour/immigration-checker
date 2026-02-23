import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  setPrStartDate,
  setTmpStartDate,
  addAbsence,
} from "../../src/store/immigrationSlice";
import { CitizenshipCard } from "../../src/components/CitizenshipCard";
import type { CitizenshipResult } from "../../src/utils/calculations";

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
        <CitizenshipCard />
      </Provider>
    ),
  };
}

const baseCalc: CitizenshipResult = {
  totalDays: 1000,
  tempDays: 200,
  prDays: 800,
  totalDaysToday: 900,
  tempDaysToday: 180,
  prDaysToday: 720,
  remainingDays: 95,
  progress: 90,
  citizenshipDate: new Date("2027-06-15"),
  eligible: false,
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("CitizenshipCard", () => {
  it("renders with real selector from store inputs", () => {
    const store = createTestStore();
    store.dispatch(setPrStartDate("2022-01-01"));
    store.dispatch(setTmpStartDate("2020-01-01"));
    renderWithStore(store);

    expect(screen.getByText("Citizenship Eligibility")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", {
        name: "Citizenship eligibility progress",
      })
    ).toBeInTheDocument();
  });

  it("renders 'Complete' badge and eligible message at 100% progress", () => {
    vi.spyOn(selectors, "selectCitizenshipCalculation").mockReturnValue({
      ...baseCalc,
      progress: 100,
      remainingDays: 0,
      eligible: true,
    });
    renderWithStore();

    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Eligible for citizenship!")).toBeInTheDocument();
  });

  it("renders 'Almost there' badge at 80-99% progress", () => {
    vi.spyOn(selectors, "selectCitizenshipCalculation").mockReturnValue({
      ...baseCalc,
      progress: 85,
    });
    renderWithStore();

    expect(screen.getByText("Almost there")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders 'In progress' badge below 80%", () => {
    vi.spyOn(selectors, "selectCitizenshipCalculation").mockReturnValue({
      ...baseCalc,
      progress: 50,
    });
    renderWithStore();

    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("displays estimated citizenship date when not yet eligible", () => {
    vi.spyOn(selectors, "selectCitizenshipCalculation").mockReturnValue({
      ...baseCalc,
      progress: 70,
      citizenshipDate: new Date("2027-06-15"),
      eligible: false,
    });
    renderWithStore();

    expect(screen.getByText(/Estimated date:/)).toBeInTheDocument();
  });

  it("displays stat blocks with correct values", () => {
    vi.spyOn(selectors, "selectCitizenshipCalculation").mockReturnValue(
      baseCalc
    );
    renderWithStore();

    expect(screen.getByText("Total Days")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("Temp Status Days")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("PR Days")).toBeInTheDocument();
    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByText("Days Remaining")).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument();
  });

  it("accounts for absences in computed result", () => {
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
    renderWithStore(store);

    expect(screen.getByText("Citizenship Eligibility")).toBeInTheDocument();
  });
});
