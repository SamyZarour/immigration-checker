import { useAppSelector } from "../store/hooks";
import { selectPrStatusCalculation } from "../store/selectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PRStatusCard() {
  const prStatus = useAppSelector(selectPrStatusCalculation);
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
            {prStatus.lossDate
              ? prStatus.lossDate.toLocaleDateString()
              : "unknown"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
