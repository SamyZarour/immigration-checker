import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer from "../../src/store/immigrationSlice";
import { DataManager } from "../../src/components/DataManager";

vi.mock("../../src/hooks/useFileHandling", () => ({
  useFileHandling: () => ({
    exportData: mockExportData,
    importData: mockImportData,
  }),
}));

const mockExportData = vi.fn();
const mockImportData = vi.fn();

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
        <DataManager />
      </Provider>
    ),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DataManager", () => {
  it("renders import and export buttons", () => {
    renderWithStore();

    expect(
      screen.getByRole("button", { name: /Import JSON/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Export JSON/i })
    ).toBeInTheDocument();
  });

  it("calls exportData when export button is clicked", async () => {
    const { user } = renderWithStore();

    await user.click(screen.getByRole("button", { name: /Export JSON/i }));

    expect(mockExportData).toHaveBeenCalledOnce();
  });

  it("triggers file input when import button is clicked", async () => {
    const { user } = renderWithStore();

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    expect(fileInput.accept).toBe(".json");

    const clickSpy = vi.spyOn(fileInput, "click");
    await user.click(screen.getByRole("button", { name: /Import JSON/i }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it("calls importData when a file is selected", async () => {
    mockImportData.mockResolvedValue({
      prStartDate: "2024-01-01",
      tmpStartDate: "2023-01-01",
      absences: [],
    });

    const { store } = renderWithStore();
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(['{"test": true}'], "data.json", {
      type: "application/json",
    });

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(mockImportData).toHaveBeenCalledWith(file);
    });

    await waitFor(() => {
      expect(store.getState().immigration.prStartDate).toBe("2024-01-01");
    });
  });

  it("shows toast on export error", async () => {
    mockExportData.mockImplementation(() => {
      throw new Error("Export failed");
    });

    const { user } = renderWithStore();
    await user.click(screen.getByRole("button", { name: /Export JSON/i }));

    expect(mockExportData).toHaveBeenCalledOnce();
  });

  it("shows toast on import error", async () => {
    mockImportData.mockRejectedValue(new Error("Invalid JSON"));

    renderWithStore();
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(["bad"], "bad.json", { type: "application/json" });
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(mockImportData).toHaveBeenCalledWith(file);
    });
  });
});
