interface ProgressBarProps {
  progress: number;
  status?: "safe" | "warning" | "danger";
}

export function ProgressBar({ progress, status = "safe" }: ProgressBarProps) {
  const getStatusClass = () => {
    if (status === "danger") return "danger";
    if (status === "warning") return "warning";
    return "";
  };

  return (
    <div className="progress-bar">
      <div
        className={`progress-fill ${getStatusClass()}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
