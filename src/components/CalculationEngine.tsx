import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  prStartDateAtom,
  tmpStartDateAtom,
  absencesAtom,
  citizenshipCalculationAtom,
  prStatusCalculationAtom,
  residencyCalculationAtom,
  isCalculatingAtom,
} from "../store/atoms";
import {
  calculateCitizenship,
  calculatePRStatus,
  calculateResidencyStatus,
} from "../utils/calculations";

export function CalculationEngine() {
  const prStartDate = useRecoilValue(prStartDateAtom);
  const tmpStartDate = useRecoilValue(tmpStartDateAtom);
  const absences = useRecoilValue(absencesAtom);

  const setCitizenshipCalculation = useSetRecoilState(
    citizenshipCalculationAtom
  );
  const setPrStatusCalculation = useSetRecoilState(prStatusCalculationAtom);
  const setResidencyCalculation = useSetRecoilState(residencyCalculationAtom);
  const setIsCalculating = useSetRecoilState(isCalculatingAtom);

  useEffect(() => {
    const performCalculations = async () => {
      setIsCalculating(true);

      // Add a small delay to make loading visible (optional)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Calculate citizenship eligibility
      const citizenship = calculateCitizenship(
        prStartDate,
        tmpStartDate,
        absences
      );
      setCitizenshipCalculation(citizenship);

      // Calculate PR status
      const prStatus = calculatePRStatus(
        prStartDate,
        citizenship.citizenshipDate || new Date(),
        absences
      );
      setPrStatusCalculation(prStatus);

      // Calculate residency status
      const residency = calculateResidencyStatus(
        citizenship.citizenshipDate || new Date(),
        absences
      );
      setResidencyCalculation(residency);

      setIsCalculating(false);
    };

    performCalculations();
  }, [
    prStartDate,
    tmpStartDate,
    absences,
    setCitizenshipCalculation,
    setPrStatusCalculation,
    setResidencyCalculation,
    setIsCalculating,
  ]);

  return null; // This component doesn't render anything
}
