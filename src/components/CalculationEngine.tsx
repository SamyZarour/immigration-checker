import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setCitizenshipCalculation,
  setPrStatusCalculation,
  setResidencyCalculation,
  setIsCalculating,
} from "../store/immigrationSlice";
import {
  calculateCitizenship,
  calculatePRStatus,
  calculateResidencyStatus,
} from "../utils/calculations";

export function CalculationEngine() {
  const dispatch = useAppDispatch();
  const prStartDate = useAppSelector((s) => s.immigration.prStartDate);
  const tmpStartDate = useAppSelector((s) => s.immigration.tmpStartDate);
  const absences = useAppSelector((s) => s.immigration.absences);

  useEffect(() => {
    const performCalculations = async () => {
      dispatch(setIsCalculating(true));

      await new Promise((resolve) => setTimeout(resolve, 300));

      const citizenship = calculateCitizenship(
        prStartDate,
        tmpStartDate,
        absences
      );
      dispatch(
        setCitizenshipCalculation({
          ...citizenship,
          citizenshipDate:
            citizenship.citizenshipDate?.toISOString().split("T")[0] ?? null,
        })
      );

      const citizenshipDate = citizenship.citizenshipDate ?? new Date();
      const prStatus = calculatePRStatus(
        prStartDate,
        citizenshipDate,
        absences
      );
      dispatch(
        setPrStatusCalculation({
          ...prStatus,
          lossDate: prStatus.lossDate?.toISOString().split("T")[0] ?? null,
        })
      );

      const residency = calculateResidencyStatus(citizenshipDate, absences);
      dispatch(setResidencyCalculation(residency));

      dispatch(setIsCalculating(false));
    };

    void performCalculations();
  }, [prStartDate, tmpStartDate, absences, dispatch]);

  return null;
}
