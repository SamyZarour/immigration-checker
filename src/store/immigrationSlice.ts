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

export interface ImmigrationState {
  prStartDate: string;
  tmpStartDate: string;
  absences: Absence[];
}

const initialState: ImmigrationState = {
  prStartDate: new Date().toISOString().split("T")[0],
  tmpStartDate: new Date().toISOString().split("T")[0],
  absences: [],
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
  loadSavedData,
} = immigrationSlice.actions;

export default immigrationSlice.reducer;
