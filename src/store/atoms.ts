import { atom } from "recoil";

export interface SavedData {
  prStartDate: string;
  tmpStartDate: string;
  absences: Absence[];
}

export interface Absence {
  startDate: string;
  endDate: string;
  description: string;
}

export interface CitizenshipCalculation {
  totalDays: number;
  tempDays: number;
  prDays: number;
  totalDaysToday: number;
  tempDaysToday: number;
  prDaysToday: number;
  remainingDays: number;
  progress: number;
  citizenshipDate: Date | null;
  eligible: boolean;
}

export interface PRStatusCalculation {
  status: "safe" | "warning" | "danger";
  lossDate: Date | null;
}

export interface ResidencyCalculation {
  status: "safe" | "warning" | "danger";
  lossDate: number | null;
}

// Date atoms
export const prStartDateAtom = atom<string>({
  key: "prStartDate",
  default: new Date().toISOString().split("T")[0],
});

export const tmpStartDateAtom = atom<string>({
  key: "tmpStartDate",
  default: new Date().toISOString().split("T")[0],
});

// Absences atom
export const absencesAtom = atom<Absence[]>({
  key: "absences",
  default: [],
});

// Calculation results atoms
export const citizenshipCalculationAtom = atom<CitizenshipCalculation | null>({
  key: "citizenshipCalculation",
  default: null,
});

export const prStatusCalculationAtom = atom<PRStatusCalculation | null>({
  key: "prStatusCalculation",
  default: null,
});

export const residencyCalculationAtom = atom<ResidencyCalculation | null>({
  key: "residencyCalculation",
  default: null,
});

// Loading state atom
export const isCalculatingAtom = atom<boolean>({
  key: "isCalculating",
  default: false,
});

// Data operation loading state atom
export const isDataLoadingAtom = atom<boolean>({
  key: "isDataLoading",
  default: false,
});
