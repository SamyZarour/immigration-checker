import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  setCitizenshipCalculation,
  setIsCalculating,
  type CitizenshipCalculation,
} from "../../src/store/immigrationSlice";
import { CitizenshipCard } from "../../src/components/CitizenshipCard";

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

const baseCalc: CitizenshipCalculation = {
  totalDays: 1000,
  tempDays: 200,
  prDays: 800,
  totalDaysToday: 900,
  tempDaysToday: 180,
  prDaysToday: 720,
  remainingDays: 95,
  progress: 90,
  citizenshipDate: null,
  eligible: false,
};

describe("CitizenshipCard", () => {
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

  it("renders 'Complete' badge and eligible message at 100% progress", () => {
    const store = createTestStore();
    store.dispatch(
      setCitizenshipCalculation({
        ...baseCalc,
        progress: 100,
        remainingDays: 0,
        eligible: true,
      })
    );
    renderWithStore(store);

    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Eligible for citizenship!")).toBeInTheDocument();
  });

  it("renders 'Almost there' badge at 80-99% progress", () => {
    const store = createTestStore();
    store.dispatch(setCitizenshipCalculation({ ...baseCalc, progress: 85 }));
    renderWithStore(store);

    expect(screen.getByText("Almost there")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders 'In progress' badge below 80%", () => {
    const store = createTestStore();
    store.dispatch(setCitizenshipCalculation({ ...baseCalc, progress: 50 }));
    renderWithStore(store);

    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("displays estimated citizenship date when not yet eligible", () => {
    const store = createTestStore();
    store.dispatch(
      setCitizenshipCalculation({
        ...baseCalc,
        progress: 70,
        citizenshipDate: "2027-06-15",
        eligible: false,
      })
    );
    renderWithStore(store);

    expect(screen.getByText(/Estimated date:/)).toBeInTheDocument();
  });

  it("displays stat blocks with correct values", () => {
    const store = createTestStore();
    store.dispatch(setCitizenshipCalculation(baseCalc));
    renderWithStore(store);

    expect(screen.getByText("Total Days")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("Temp Status Days")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("PR Days")).toBeInTheDocument();
    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByText("Days Remaining")).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument();
  });

  it("renders progress bar with correct aria label", () => {
    const store = createTestStore();
    store.dispatch(setCitizenshipCalculation(baseCalc));
    renderWithStore(store);

    expect(
      screen.getByRole("progressbar", {
        name: "Citizenship eligibility progress",
      })
    ).toBeInTheDocument();
  });
});
