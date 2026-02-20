import { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  loadSavedData,
  setIsDataLoading,
  type SavedData,
} from "../store/immigrationSlice";
import { useFileHandling } from "../hooks/useFileHandling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Download } from "lucide-react";

export function DataManager() {
  const dispatch = useAppDispatch();
  const prStartDate = useAppSelector((s) => s.immigration.prStartDate);
  const tmpStartDate = useAppSelector((s) => s.immigration.tmpStartDate);
  const absences = useAppSelector((s) => s.immigration.absences);
  const isDataLoading = useAppSelector((s) => s.immigration.isDataLoading);
  const { exportData, importData } = useFileHandling();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    dispatch(setIsDataLoading(true));
    try {
      const data: SavedData = { prStartDate, tmpStartDate, absences };
      exportData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to export data: ${errorMessage}`);
    } finally {
      dispatch(setIsDataLoading(false));
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch(setIsDataLoading(true));
      importData(file)
        .then((data) => {
          dispatch(loadSavedData(data));
        })
        .catch((error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          alert(`Failed to import data: ${errorMessage}`);
        })
        .finally(() => {
          dispatch(setIsDataLoading(false));
        });
    }
  };

  return (
    <Card className="flex-1 min-w-[280px]">
      <CardHeader>
        <CardTitle className="text-base">Import / Export</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          disabled={isDataLoading}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDataLoading}
        >
          {isDataLoading ? <Loader2 className="animate-spin" /> : <Upload />}
          Import JSON
        </Button>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isDataLoading}
        >
          {isDataLoading ? <Loader2 className="animate-spin" /> : <Download />}
          Export JSON
        </Button>
      </CardContent>
    </Card>
  );
}
