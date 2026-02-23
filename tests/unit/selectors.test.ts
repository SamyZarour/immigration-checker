import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import immigrationReducer, {
  setPrStartDate,
  setTmpStartDate,
  addAbsence,
} from "../../src/store/immigrationSlice";
import {
  selectCitizenshipCalculation,
  selectPrStatusCalculation,
  selectResidencyCalculation,
} from "../../src/store/selectors";

function createTestStore() {
  return configureStore({
    reducer: { immigration: immigrationReducer },
  });
}

describe("selectors", () => {
  describe("selectCitizenshipCalculation", () => {
    it("computes citizenship result from store state", () => {
      const store = createTestStore();
      store.dispatch(setPrStartDate("2022-01-01"));
      store.dispatch(setTmpStartDate("2020-01-01"));

      const result = selectCitizenshipCalculation(store.getState());

      expect(result.totalDays).toBeGreaterThan(0);
      expect(result.prDays).toBeGreaterThan(0);
      expect(result.citizenshipDate).toBeInstanceOf(Date);
      expect(typeof result.progress).toBe("number");
      expect(typeof result.eligible).toBe("boolean");
    });

    it("returns memoized result when inputs unchanged", () => {
      const store = createTestStore();
      store.dispatch(setPrStartDate("2022-01-01"));
      store.dispatch(setTmpStartDate("2020-01-01"));

      const result1 = selectCitizenshipCalculation(store.getState());
      const result2 = selectCitizenshipCalculation(store.getState());

      expect(result1).toBe(result2);
    });

    it("recomputes when inputs change", () => {
      const store = createTestStore();
      store.dispatch(setPrStartDate("2022-01-01"));
      store.dispatch(setTmpStartDate("2020-01-01"));

      const result1 = selectCitizenshipCalculation(store.getState());

      store.dispatch(setPrStartDate("2023-06-01"));
      const result2 = selectCitizenshipCalculation(store.getState());

      expect(result1).not.toBe(result2);
    });

    it("accounts for absences", () => {
      const store = createTestStore();
      store.dispatch(setPrStartDate("2022-01-01"));
      store.dispatch(setTmpStartDate("2020-01-01"));

      const withoutAbsences = selectCitizenshipCalculation(store.getState());

      store.dispatch(
        addAbsence({
          startDate: "2023-06-01",
          endDate: "2023-12-31",
          description: "Away",
        })
      );

      const withAbsences = selectCitizenshipCalculation(store.getState());

      expect(withAbsences.totalDaysToday).toBeLessThan(
        withoutAbsences.totalDaysToday
      );
    });
  });

  describe("selectPrStatusCalculation", () => {
    it("computes PR status from store state", () => {
      const store = createTestStore();
      store.dispatch(setPrStartDate("2022-01-01"));
      store.dispatch(setTmpStartDate("2020-01-01"));

      const result = selectPrStatusCalculation(store.getState());

      expect(["safe", "warning", "danger"]).toContain(result.status);
    });

    it("returns memoized result when inputs unchanged", () => {
      const store = createTestStore();
      store.dispatch(setPrStartDate("2022-01-01"));
      store.dispatch(setTmpStartDate("2020-01-01"));

      const result1 = selectPrStatusCalculation(store.getState());
      const result2 = selectPrStatusCalculation(store.getState());

      expect(result1).toBe(result2);
    });
  });

  describe("selectResidencyCalculation", () => {
    it("computes residency status from store state", () => {
      const store = createTestStore();
      store.dispatch(setPrStartDate("2022-01-01"));
      store.dispatch(setTmpStartDate("2020-01-01"));

      const result = selectResidencyCalculation(store.getState());

      expect(["safe", "warning", "danger"]).toContain(result.status);
    });

    it("returns memoized result when inputs unchanged", () => {
      const store = createTestStore();
      store.dispatch(setPrStartDate("2022-01-01"));
      store.dispatch(setTmpStartDate("2020-01-01"));

      const result1 = selectResidencyCalculation(store.getState());
      const result2 = selectResidencyCalculation(store.getState());

      expect(result1).toBe(result2);
    });
  });
});
