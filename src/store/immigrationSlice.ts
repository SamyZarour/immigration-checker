import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Absence {
  startDate: string;
  endDate: string;
  description: string;
}

export interface SavedData {
  prStartDate: string;
  tmpStartDate: string;
  absences: Absence[];
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
  citizenshipDate: string | null;
  eligible: boolean;
}

export interface PRStatusCalculation {
  status: "safe" | "warning" | "danger";
  lossDate: string | null;
}

export interface ResidencyCalculation {
  status: "safe" | "warning" | "danger";
  lossDate: number | null;
}

interface ImmigrationState {
  prStartDate: string;
  tmpStartDate: string;
  absences: Absence[];
  citizenshipCalculation: CitizenshipCalculation | null;
  prStatusCalculation: PRStatusCalculation | null;
  residencyCalculation: ResidencyCalculation | null;
  isCalculating: boolean;
  isDataLoading: boolean;
}

const initialState: ImmigrationState = {
  prStartDate: new Date().toISOString().split("T")[0],
  tmpStartDate: new Date().toISOString().split("T")[0],
  absences: [],
  citizenshipCalculation: null,
  prStatusCalculation: null,
  residencyCalculation: null,
  isCalculating: false,
  isDataLoading: false,
};

const immigrationSlice = createSlice({
  name: "immigration",
  initialState,
  reducers: {
    setPrStartDate(state, action: PayloadAction<string>) {
      state.prStartDate = action.payload;
    },
    setTmpStartDate(state, action: PayloadAction<string>) {
      state.tmpStartDate = action.payload;
    },
    setAbsences(state, action: PayloadAction<Absence[]>) {
      state.absences = action.payload;
    },
    addAbsence(state, action: PayloadAction<Absence>) {
      state.absences.push(action.payload);
    },
    removeAbsence(state, action: PayloadAction<number>) {
      state.absences.splice(action.payload, 1);
    },
    setCitizenshipCalculation(
      state,
      action: PayloadAction<CitizenshipCalculation | null>
    ) {
      state.citizenshipCalculation = action.payload;
    },
    setPrStatusCalculation(
      state,
      action: PayloadAction<PRStatusCalculation | null>
    ) {
      state.prStatusCalculation = action.payload;
    },
    setResidencyCalculation(
      state,
      action: PayloadAction<ResidencyCalculation | null>
    ) {
      state.residencyCalculation = action.payload;
    },
    setIsCalculating(state, action: PayloadAction<boolean>) {
      state.isCalculating = action.payload;
    },
    setIsDataLoading(state, action: PayloadAction<boolean>) {
      state.isDataLoading = action.payload;
    },
    loadSavedData(state, action: PayloadAction<SavedData>) {
      state.prStartDate = action.payload.prStartDate;
      state.tmpStartDate = action.payload.tmpStartDate;
      state.absences = action.payload.absences;
    },
  },
});

export const {
  setPrStartDate,
  setTmpStartDate,
  setAbsences,
  addAbsence,
  removeAbsence,
  setCitizenshipCalculation,
  setPrStatusCalculation,
  setResidencyCalculation,
  setIsCalculating,
  setIsDataLoading,
  loadSavedData,
} = immigrationSlice.actions;

export default immigrationSlice.reducer;
