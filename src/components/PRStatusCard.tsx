import { useRecoilValue } from "recoil";
import { prStatusCalculationAtom, isCalculatingAtom } from "../store/atoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function PRStatusCard() {
  const prStatus = useRecoilValue(prStatusCalculationAtom);
  const isCalculating = useRecoilValue(isCalculatingAtom);

  if (isCalculating) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">PR Status</CardTitle>
            <Badge variant="secondary">Calculating</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="mr-2 size-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Calculating...</span>
        </CardContent>
      </Card>
    );
  }

  if (!prStatus) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">PR Status</CardTitle>
            <Badge variant="secondary">Pending</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enter your dates to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  const isSafe = prStatus.status === "safe";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">PR Status</CardTitle>
          <Badge variant={isSafe ? "default" : "destructive"}>
            {isSafe ? "Secure" : "At Risk"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isSafe ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            PR status is secure
          </div>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            PR status in danger — deadline is{" "}
            {prStatus.lossDate?.toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
