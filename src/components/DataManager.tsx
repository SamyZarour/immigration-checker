import { useRecoilState } from "recoil";
import {
  prStartDateAtom,
  tmpStartDateAtom,
  absencesAtom,
} from "../store/atoms";
import { useFileHandling } from "../hooks/useFileHandling";

export function DataManager() {
  const [prStartDate, setPrStartDate] = useRecoilState(prStartDateAtom);
  const [tmpStartDate, setTempStartDate] = useRecoilState(tmpStartDateAtom);
  const [absences, setAbsences] = useRecoilState(absencesAtom);
  const { exportData, importData } = useFileHandling();

  const handleExport = () => {
    const data = {
      prStartDate,
      tmpStartDate,
      absences,
    };
    exportData(data);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file)
        .then((data) => {
          setPrStartDate(data.prStartDate);
          setTempStartDate(data.tmpStartDate);
          setAbsences(data.absences);
        })
        .catch((error) => {
          alert(`Failed to import data: ${error.message}`);
        });
    }
  };

  return (
    <div className="input-group">
      <h3>📤 Import/Export Data</h3>
      <input
        type="file"
        id="jsonFile"
        accept=".json"
        onChange={handleImport}
        style={{ display: "none" }}
      />
      <label htmlFor="jsonFile" className="file-label">
        📁 Import JSON
      </label>
      <button className="btn btn-secondary" onClick={handleExport}>
        📥 Export JSON
      </button>
    </div>
  );
}
