import { useRecoilValue } from "recoil";
import { residencyCalculationAtom, isCalculatingAtom } from "../store/atoms";
import { LoadingSpinner } from "./LoadingSpinner";

export function ResidencyCard() {
  const residency = useRecoilValue(residencyCalculationAtom);
  const isCalculating = useRecoilValue(isCalculatingAtom);

  if (isCalculating) {
    return (
      <div className="result-card residency">
        <h3>
          <span className="status-indicator status-danger"></span>
          📍 Residency Status Loss Date
        </h3>
        <div className="loading-overlay">
          <LoadingSpinner size="medium" />
          <span className="loading-text">Calculating...</span>
        </div>
      </div>
    );
  }

  if (!residency) {
    return (
      <div className="result-card residency">
        <h3>
          <span className="status-indicator status-danger"></span>
          📍 Residency Status Loss Date
        </h3>
        <p>Click "Calculate All" to see results</p>
      </div>
    );
  }

  const getStatusMessage = () => {
    if (residency.status === "safe") {
      return "✅ Residency status maintained";
    } else {
      return "❌ Residency status in danger, deadline is " + residency.lossDate;
    }
  };

  return (
    <div className="result-card residency">
      <h3>
        <span className={`status-indicator status-${residency.status}`}></span>
        📍 Residency Status Loss Date
      </h3>
      <p>{getStatusMessage()}</p>
    </div>
  );
}
