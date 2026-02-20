import { useAppSelector } from "../store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function ResidencyCard() {
  const residency = useAppSelector((s) => s.immigration.residencyCalculation);
  const isCalculating = useAppSelector((s) => s.immigration.isCalculating);

  if (isCalculating) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Residency Obligation</CardTitle>
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

  if (!residency) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Residency Obligation</CardTitle>
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

  const isSafe = residency.status === "safe";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Residency Obligation</CardTitle>
          <Badge variant={isSafe ? "default" : "destructive"}>
            {isSafe ? "Maintained" : "At Risk"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isSafe ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Residency status maintained
          </div>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            Residency status in danger — deadline is {residency.lossDate}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
