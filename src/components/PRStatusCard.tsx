import { useRecoilValue } from "recoil";
import { prStatusCalculationAtom, isCalculatingAtom } from "../store/atoms";
import { LoadingSpinner } from "./LoadingSpinner";

export function PRStatusCard() {
  const prStatus = useRecoilValue(prStatusCalculationAtom);
  const isCalculating = useRecoilValue(isCalculatingAtom);

  if (isCalculating) {
    return (
      <div className="result-card pr-status">
        <h3>
          <span className="status-indicator status-warning"></span>
          🏠 PR Status Loss Date
        </h3>
        <div className="loading-overlay">
          <LoadingSpinner size="medium" />
          <span className="loading-text">Calculating...</span>
        </div>
      </div>
    );
  }

  if (!prStatus) {
    return (
      <div className="result-card pr-status">
        <h3>
          <span className="status-indicator status-warning"></span>
          🏠 PR Status Loss Date
        </h3>
        <p>Click "Calculate All" to see results</p>
      </div>
    );
  }

  const getStatusMessage = () => {
    if (prStatus.status === "safe") {
      return "✅ PR status is secure";
    } else {
      return (
        "❌ PR status in danger, deadline is " +
        prStatus.lossDate?.toLocaleDateString()
      );
    }
  };

  return (
    <div className="result-card pr-status">
      <h3>
        <span className={`status-indicator status-${prStatus.status}`}></span>
        🏠 PR Status Loss Date
      </h3>
      <p>{getStatusMessage()}</p>
    </div>
  );
}
