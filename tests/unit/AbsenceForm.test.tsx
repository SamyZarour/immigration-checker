import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer from "../../src/store/immigrationSlice";
import { AbsenceForm } from "../../src/components/AbsenceForm";

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
        <AbsenceForm />
      </Provider>
    ),
  };
}

describe("AbsenceForm", () => {
  it("renders all form fields", () => {
    renderWithStore();

    expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
    expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Description (optional)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Absence" })
    ).toBeInTheDocument();
  });

  it("dispatches addAbsence with valid data and resets form", async () => {
    const { store, user } = renderWithStore();

    await user.type(screen.getByLabelText("Start Date"), "2024-06-01");
    await user.type(screen.getByLabelText("End Date"), "2024-06-15");
    await user.type(
      screen.getByLabelText("Description (optional)"),
      "Vacation"
    );
    await user.click(screen.getByRole("button", { name: "Add Absence" }));

    await waitFor(() => {
      const absences = store.getState().immigration.absences;
      expect(absences).toHaveLength(1);
      expect(absences[0]).toEqual({
        startDate: "2024-06-01",
        endDate: "2024-06-15",
        description: "Vacation",
      });
    });
  });

  it("shows validation error when start date is empty", async () => {
    const { user } = renderWithStore();

    await user.type(screen.getByLabelText("End Date"), "2024-06-15");
    await user.click(screen.getByRole("button", { name: "Add Absence" }));

    await waitFor(() => {
      expect(screen.getByText("Start date is required")).toBeInTheDocument();
    });
  });

  it("shows validation error when end date is empty", async () => {
    const { user } = renderWithStore();

    await user.type(screen.getByLabelText("Start Date"), "2024-06-01");
    await user.click(screen.getByRole("button", { name: "Add Absence" }));

    await waitFor(() => {
      expect(screen.getByText("End date is required")).toBeInTheDocument();
    });
  });

  it("shows validation error when start date is after end date", async () => {
    const { user } = renderWithStore();

    await user.type(screen.getByLabelText("Start Date"), "2024-06-15");
    await user.type(screen.getByLabelText("End Date"), "2024-06-01");
    await user.click(screen.getByRole("button", { name: "Add Absence" }));

    await waitFor(() => {
      expect(
        screen.getByText("Start date must be before or equal to end date")
      ).toBeInTheDocument();
    });
  });

  it("submits successfully with empty description", async () => {
    const { store, user } = renderWithStore();

    await user.type(screen.getByLabelText("Start Date"), "2024-06-01");
    await user.type(screen.getByLabelText("End Date"), "2024-06-15");
    await user.click(screen.getByRole("button", { name: "Add Absence" }));

    await waitFor(() => {
      const absences = store.getState().immigration.absences;
      expect(absences).toHaveLength(1);
      expect(absences[0].description).toBe("");
    });
  });
});
