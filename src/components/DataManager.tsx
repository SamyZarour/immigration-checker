import { useRecoilState } from "recoil";
import {
  prStartDateAtom,
  tmpStartDateAtom,
  absencesAtom,
  isDataLoadingAtom,
} from "../store/atoms";
import { useFileHandling } from "../hooks/useFileHandling";
import { LoadingSpinner } from "./LoadingSpinner";

export function DataManager() {
  const [prStartDate, setPrStartDate] = useRecoilState(prStartDateAtom);
  const [tmpStartDate, setTempStartDate] = useRecoilState(tmpStartDateAtom);
  const [absences, setAbsences] = useRecoilState(absencesAtom);
  const [isDataLoading, setIsDataLoading] = useRecoilState(isDataLoadingAtom);
  const { exportData, importData } = useFileHandling();

  const handleExport = async () => {
    setIsDataLoading(true);
    try {
      const data = {
        prStartDate,
        tmpStartDate,
        absences,
      };
      await exportData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to export data: ${errorMessage}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsDataLoading(true);
      try {
        const data = await importData(file);
        setPrStartDate(data.prStartDate);
        setTempStartDate(data.tmpStartDate);
        setAbsences(data.absences);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        alert(`Failed to import data: ${errorMessage}`);
      } finally {
        setIsDataLoading(false);
      }
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
        disabled={isDataLoading}
      />
      <label
        htmlFor="jsonFile"
        className={`file-label ${isDataLoading ? "disabled" : ""}`}
      >
        {isDataLoading ? (
          <>
            <LoadingSpinner size="small" />
            <span style={{ marginLeft: "8px" }}>Importing...</span>
          </>
        ) : (
          "📁 Import JSON"
        )}
      </label>
      <button
        className={`btn btn-secondary ${isDataLoading ? "disabled" : ""}`}
        onClick={handleExport}
        disabled={isDataLoading}
      >
        {isDataLoading ? (
          <>
            <LoadingSpinner size="small" />
            <span style={{ marginLeft: "8px" }}>Exporting...</span>
          </>
        ) : (
          "📥 Export JSON"
        )}
      </button>
    </div>
  );
}
