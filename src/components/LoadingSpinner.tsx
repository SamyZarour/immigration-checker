import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

export function LoadingSpinner({
  size = "medium",
  color = "#6366f1",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`loading-spinner ${size}`}
      style={{ borderTopColor: color }}
    >
      <div className="spinner"></div>
    </div>
  );
}
