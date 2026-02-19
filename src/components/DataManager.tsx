import { useRef } from "react";
import { useRecoilState } from "recoil";
import {
  prStartDateAtom,
  tmpStartDateAtom,
  absencesAtom,
  isDataLoadingAtom,
} from "../store/atoms";
import { useFileHandling } from "../hooks/useFileHandling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Download } from "lucide-react";

export function DataManager() {
  const [prStartDate, setPrStartDate] = useRecoilState(prStartDateAtom);
  const [tmpStartDate, setTempStartDate] = useRecoilState(tmpStartDateAtom);
  const [absences, setAbsences] = useRecoilState(absencesAtom);
  const [isDataLoading, setIsDataLoading] = useRecoilState(isDataLoadingAtom);
  const { exportData, importData } = useFileHandling();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsDataLoading(true);
    try {
      const data = { prStartDate, tmpStartDate, absences };
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
