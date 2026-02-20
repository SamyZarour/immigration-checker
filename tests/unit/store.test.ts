import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  setPrStartDate,
  setTmpStartDate,
  addAbsence,
  removeAbsence,
  setAbsences,
  setCitizenshipCalculation,
  setPrStatusCalculation,
  setResidencyCalculation,
  setIsCalculating,
  setIsDataLoading,
  loadSavedData,
} from "../../src/store/immigrationSlice";

function createTestStore() {
  return configureStore({
    reducer: { immigration: immigrationReducer },
  });
}

describe("immigrationSlice", () => {
  it("has correct initial state shape", () => {
    const store = createTestStore();
    const state = store.getState().immigration;

    expect(state.prStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(state.tmpStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(state.absences).toEqual([]);
    expect(state.citizenshipCalculation).toBeNull();
    expect(state.prStatusCalculation).toBeNull();
    expect(state.residencyCalculation).toBeNull();
    expect(state.isCalculating).toBe(false);
    expect(state.isDataLoading).toBe(false);
  });

  describe("date actions", () => {
    it("setPrStartDate updates PR start date", () => {
      const store = createTestStore();
      store.dispatch(setPrStartDate("2023-10-30"));
      expect(store.getState().immigration.prStartDate).toBe("2023-10-30");
    });

    it("setTmpStartDate updates temp start date", () => {
      const store = createTestStore();
      store.dispatch(setTmpStartDate("2019-12-02"));
      expect(store.getState().immigration.tmpStartDate).toBe("2019-12-02");
    });
  });

  describe("absence actions", () => {
    it("addAbsence appends to list", () => {
      const store = createTestStore();
      store.dispatch(
        addAbsence({
          startDate: "2024-06-01",
          endDate: "2024-06-15",
          description: "Vacation",
        })
      );

      const absences = store.getState().immigration.absences;
      expect(absences).toHaveLength(1);
      expect(absences[0].description).toBe("Vacation");
    });

    it("addAbsence appends multiple absences in order", () => {
      const store = createTestStore();
      store.dispatch(
        addAbsence({
          startDate: "2024-01-01",
          endDate: "2024-01-10",
          description: "A",
        })
      );
      store.dispatch(
        addAbsence({
          startDate: "2024-03-01",
          endDate: "2024-03-10",
          description: "B",
        })
      );

      const absences = store.getState().immigration.absences;
      expect(absences).toHaveLength(2);
      expect(absences[0].description).toBe("A");
      expect(absences[1].description).toBe("B");
    });

    it("removeAbsence removes by index", () => {
      const store = createTestStore();
      store.dispatch(
        addAbsence({
          startDate: "2024-01-01",
          endDate: "2024-01-10",
          description: "A",
        })
      );
      store.dispatch(
        addAbsence({
          startDate: "2024-03-01",
          endDate: "2024-03-10",
          description: "B",
        })
      );

      store.dispatch(removeAbsence(0));

      const absences = store.getState().immigration.absences;
      expect(absences).toHaveLength(1);
      expect(absences[0].description).toBe("B");
    });

    it("setAbsences replaces the entire list", () => {
      const store = createTestStore();
      store.dispatch(
        addAbsence({
          startDate: "2024-01-01",
          endDate: "2024-01-10",
          description: "Old",
        })
      );

      store.dispatch(
        setAbsences([
          {
            startDate: "2025-01-01",
            endDate: "2025-01-10",
            description: "New",
          },
        ])
      );

      const absences = store.getState().immigration.absences;
      expect(absences).toHaveLength(1);
      expect(absences[0].description).toBe("New");
    });
  });

  describe("calculation actions", () => {
    it("setCitizenshipCalculation stores result", () => {
      const store = createTestStore();
      const calc = {
        totalDays: 1095,
        tempDays: 365,
        prDays: 730,
        totalDaysToday: 900,
        tempDaysToday: 300,
        prDaysToday: 600,
        remainingDays: 195,
        progress: 82.2,
        citizenshipDate: "2026-06-01",
        eligible: false,
      };

      store.dispatch(setCitizenshipCalculation(calc));
      expect(store.getState().immigration.citizenshipCalculation).toEqual(calc);
    });

    it("setPrStatusCalculation stores result", () => {
      const store = createTestStore();
      store.dispatch(
        setPrStatusCalculation({ status: "safe", lossDate: null })
      );
      expect(store.getState().immigration.prStatusCalculation).toEqual({
        status: "safe",
        lossDate: null,
      });
    });

    it("setResidencyCalculation stores result", () => {
      const store = createTestStore();
      store.dispatch(
        setResidencyCalculation({ status: "danger", lossDate: 2025 })
      );
      expect(store.getState().immigration.residencyCalculation).toEqual({
        status: "danger",
        lossDate: 2025,
      });
    });
  });

  describe("loading state actions", () => {
    it("setIsCalculating toggles calculating flag", () => {
      const store = createTestStore();
      store.dispatch(setIsCalculating(true));
      expect(store.getState().immigration.isCalculating).toBe(true);
      store.dispatch(setIsCalculating(false));
      expect(store.getState().immigration.isCalculating).toBe(false);
    });

    it("setIsDataLoading toggles data loading flag", () => {
      const store = createTestStore();
      store.dispatch(setIsDataLoading(true));
      expect(store.getState().immigration.isDataLoading).toBe(true);
    });
  });

  describe("loadSavedData", () => {
    it("replaces dates and absences in one action", () => {
      const store = createTestStore();
      store.dispatch(
        addAbsence({ startDate: "old", endDate: "old", description: "old" })
      );

      store.dispatch(
        loadSavedData({
          prStartDate: "2023-10-30",
          tmpStartDate: "2019-12-02",
          absences: [
            {
              startDate: "2024-06-01",
              endDate: "2024-06-15",
              description: "Imported",
            },
          ],
        })
      );

      const state = store.getState().immigration;
      expect(state.prStartDate).toBe("2023-10-30");
      expect(state.tmpStartDate).toBe("2019-12-02");
      expect(state.absences).toHaveLength(1);
      expect(state.absences[0].description).toBe("Imported");
    });

    it("does not affect calculation state", () => {
      const store = createTestStore();
      store.dispatch(setIsCalculating(true));

      store.dispatch(
        loadSavedData({
          prStartDate: "2023-01-01",
          tmpStartDate: "2020-01-01",
          absences: [],
        })
      );

      expect(store.getState().immigration.isCalculating).toBe(true);
    });
  });
});
