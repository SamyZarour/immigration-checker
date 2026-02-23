import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import {
  calculateCitizenship,
  calculatePRStatus,
  calculateResidencyStatus,
  type CitizenshipResult,
  type PRStatusResult,
  type ResidencyResult,
} from "../utils/calculations";

const selectPrStartDate = (state: RootState) => state.immigration.prStartDate;
const selectTmpStartDate = (state: RootState) => state.immigration.tmpStartDate;
const selectAbsences = (state: RootState) => state.immigration.absences;

export const selectCitizenshipCalculation = createSelector(
  [selectPrStartDate, selectTmpStartDate, selectAbsences],
  (prStartDate, tmpStartDate, absences): CitizenshipResult =>
    calculateCitizenship(prStartDate, tmpStartDate, absences)
);

export const selectPrStatusCalculation = createSelector(
  [selectPrStartDate, selectCitizenshipCalculation, selectAbsences],
  (prStartDate, citizenship, absences): PRStatusResult =>
    calculatePRStatus(
      prStartDate,
      citizenship.citizenshipDate ?? new Date(),
      absences
    )
);

export const selectResidencyCalculation = createSelector(
  [selectCitizenshipCalculation, selectAbsences],
  (citizenship, absences): ResidencyResult =>
    calculateResidencyStatus(
      citizenship.citizenshipDate ?? new Date(),
      absences
    )
);
