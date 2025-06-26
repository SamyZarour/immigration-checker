import { useRecoilValue } from "recoil";
import { citizenshipCalculationAtom, isCalculatingAtom } from "../store/atoms";
import { ProgressBar } from "./ProgressBar";
import { StatsGrid } from "./StatsGrid";
import { LoadingSpinner } from "./LoadingSpinner";

export function CitizenshipCard() {
  const citizenship = useRecoilValue(citizenshipCalculationAtom);
  const isCalculating = useRecoilValue(isCalculatingAtom);

  if (isCalculating) {
    return (
      <div className="result-card citizenship">
        <h3>
          <span className="status-indicator status-safe"></span>
          🎯 Citizenship Eligibility Date
        </h3>
        <div className="loading-overlay">
          <LoadingSpinner size="medium" />
          <span className="loading-text">Calculating...</span>
        </div>
      </div>
    );
  }

  if (!citizenship) {
    return (
      <div className="result-card citizenship">
        <h3>
          <span className="status-indicator status-safe"></span>
          🎯 Citizenship Eligibility Date
        </h3>
        <p>Click "Calculate All" to see results</p>
      </div>
    );
  } else {
    console.log(citizenship);
  }

  const statsToday = [
    { number: citizenship.totalDaysToday, label: "Total Days Today" },
    { number: citizenship.tempDaysToday, label: "Temp Status Days Today" },
    { number: citizenship.prDaysToday, label: "PR Days Today" },
  ];
  const stats = [
    { number: citizenship.totalDays, label: "Total Days" },
    { number: citizenship.tempDays, label: "Temp Status Days" },
    { number: citizenship.prDays, label: "PR Days" },
  ];
  const statsRemaining = [
    { number: citizenship.remainingDays, label: "Days Remaining" },
  ];

  const getStatusClass = () => {
    if (citizenship.progress >= 100) return "safe";
    if (citizenship.progress >= 80) return "warning";
    return "danger";
  };

  return (
    <div className="result-card citizenship">
      <h3>
        <span className={`status-indicator status-${getStatusClass()}`}></span>
        🎯 Citizenship Eligibility Date
      </h3>
      <ProgressBar progress={citizenship.progress} status={getStatusClass()} />
      <StatsGrid stats={statsRemaining} />
      <StatsGrid stats={stats} />
      <StatsGrid stats={statsToday} />
      {citizenship.eligible ? (
        <p>
          <strong>✅ Eligible for citizenship!</strong>
        </p>
      ) : citizenship.citizenshipDate ? (
        <p>
          <strong>
            📅 Estimated citizenship date:{" "}
            {citizenship.citizenshipDate.toLocaleDateString()}
          </strong>
        </p>
      ) : null}
    </div>
  );
}
