import { useCallback } from "react";
import { SavedData } from "../store/atoms";

export function useFileHandling() {
  const exportData = useCallback((data: SavedData) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pr-planner-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback((file: File): Promise<SavedData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch {
          reject(new Error("Invalid JSON file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }, []);

  return { exportData, importData };
}
