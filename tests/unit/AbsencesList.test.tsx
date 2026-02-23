import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  addAbsence,
} from "../../src/store/immigrationSlice";
import { AbsencesList } from "../../src/components/AbsencesList";

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
        <AbsencesList />
      </Provider>
    ),
  };
}

describe("AbsencesList", () => {
  it("renders empty state when no absences exist", () => {
    renderWithStore();

    expect(screen.getByText("No absences recorded")).toBeInTheDocument();
  });

  it("renders a list of absences with dates", () => {
    const store = createTestStore();
    store.dispatch(
      addAbsence({
        startDate: "2024-01-01",
        endDate: "2024-01-15",
        description: "",
      })
    );
    store.dispatch(
      addAbsence({
        startDate: "2024-06-01",
        endDate: "2024-06-30",
        description: "Vacation",
      })
    );
    renderWithStore(store);

    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    expect(screen.getByText("2024-06-01")).toBeInTheDocument();
    expect(screen.getByText("2024-06-30")).toBeInTheDocument();
    expect(screen.getByText("(Vacation)")).toBeInTheDocument();
  });

  it("does not render description parentheses when description is empty", () => {
    const store = createTestStore();
    store.dispatch(
      addAbsence({
        startDate: "2024-03-01",
        endDate: "2024-03-10",
        description: "",
      })
    );
    renderWithStore(store);

    expect(screen.getByText("2024-03-01")).toBeInTheDocument();
    expect(screen.queryByText(/\(.*\)/)).not.toBeInTheDocument();
  });

  it("removes an absence when delete button is clicked", async () => {
    const store = createTestStore();
    store.dispatch(
      addAbsence({
        startDate: "2024-01-01",
        endDate: "2024-01-15",
        description: "Trip",
      })
    );
    const { user } = renderWithStore(store);

    expect(store.getState().immigration.absences).toHaveLength(1);

    await user.click(
      screen.getByRole("button", { name: "Remove absence Trip" })
    );

    expect(store.getState().immigration.absences).toHaveLength(0);
  });

  it("uses start date in aria-label when no description", () => {
    const store = createTestStore();
    store.dispatch(
      addAbsence({
        startDate: "2024-05-01",
        endDate: "2024-05-10",
        description: "",
      })
    );
    renderWithStore(store);

    expect(
      screen.getByRole("button", { name: "Remove absence 2024-05-01" })
    ).toBeInTheDocument();
  });
});
