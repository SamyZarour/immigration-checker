import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  setPrStartDate,
  setTmpStartDate,
  addAbsence,
  removeAbsence,
  setAbsences,
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

    it("setAbsences produces a flat array, not nested", () => {
      const store = createTestStore();
      const payload = [
        {
          startDate: "2024-01-01",
          endDate: "2024-01-10",
          description: "A",
        },
        {
          startDate: "2024-02-01",
          endDate: "2024-02-10",
          description: "B",
        },
        {
          startDate: "2024-03-01",
          endDate: "2024-03-10",
          description: "C",
        },
      ];

      store.dispatch(setAbsences(payload));

      const absences = store.getState().immigration.absences;
      expect(absences).toHaveLength(3);
      expect(absences).toEqual(payload);
      absences.forEach((absence) => {
        expect(absence).toHaveProperty("startDate");
        expect(absence).toHaveProperty("endDate");
        expect(absence).toHaveProperty("description");
      });
    });

    it("setAbsences with empty array clears all absences", () => {
      const store = createTestStore();
      store.dispatch(
        addAbsence({
          startDate: "2024-01-01",
          endDate: "2024-01-10",
          description: "Existing",
        })
      );

      store.dispatch(setAbsences([]));

      expect(store.getState().immigration.absences).toEqual([]);
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
  });
});
