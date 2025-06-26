import { useRecoilState } from "recoil";
import { absencesAtom } from "../store/atoms";

export function AbsencesList() {
  const [absences, setAbsences] = useRecoilState(absencesAtom);

  const removeAbsence = (index: number) => {
    setAbsences((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="result-card">
      <h3>📊 Current Absences</h3>
      {absences.length === 0 ? (
        <p>No absences recorded</p>
      ) : (
        <div className="absence-list">
          {absences.map((absence, index) => (
            <div key={index} className="absence-item">
              <div>
                <strong>{absence.startDate}</strong> to{" "}
                <strong>{absence.endDate}</strong>
                {absence.description && ` (${absence.description})`}
              </div>
              <button
                className="btn btn-danger"
                onClick={() => removeAbsence(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
