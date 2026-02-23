import { useAppSelector } from "../store/hooks";
import { selectCitizenshipCalculation } from "../store/selectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

function StatBlock({ stats }: { stats: { number: number; label: string }[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="rounded-lg bg-muted/50 p-3 text-center">
          <div className="text-2xl font-bold tracking-tight">{stat.number}</div>
          <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export function CitizenshipCard() {
  const citizenship = useAppSelector(selectCitizenshipCalculation);

  const getStatusVariant = () => {
    if (citizenship.progress >= 100) return "default" as const;
    if (citizenship.progress >= 80) return "outline" as const;
    return "destructive" as const;
  };

  const getStatusLabel = () => {
    if (citizenship.progress >= 100) return "Complete";
    if (citizenship.progress >= 80) return "Almost there";
    return "In progress";
  };

  const getProgressColor = () => {
    if (citizenship.progress >= 100)
      return "[&>[data-slot=progress-indicator]]:bg-emerald-500";
    if (citizenship.progress >= 80)
      return "[&>[data-slot=progress-indicator]]:bg-amber-500";
    return "[&>[data-slot=progress-indicator]]:bg-red-500";
  };

  const statsRemaining = [
    { number: citizenship.remainingDays, label: "Days Remaining" },
  ];
  const stats = [
    { number: citizenship.totalDays, label: "Total Days" },
    { number: citizenship.tempDays, label: "Temp Status Days" },
    { number: citizenship.prDays, label: "PR Days" },
  ];
  const statsToday = [
    { number: citizenship.totalDaysToday, label: "Total Days Today" },
    { number: citizenship.tempDaysToday, label: "Temp Days Today" },
    { number: citizenship.prDaysToday, label: "PR Days Today" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Citizenship Eligibility</CardTitle>
          <Badge variant={getStatusVariant()}>{getStatusLabel()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {Math.round(citizenship.progress)}%
            </span>
          </div>
          <Progress
            value={Math.min(citizenship.progress, 100)}
            aria-label="Citizenship eligibility progress"
            className={getProgressColor()}
          />
        </div>

        <StatBlock stats={statsRemaining} />
        <StatBlock stats={stats} />
        <StatBlock stats={statsToday} />

        {citizenship.eligible ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Eligible for citizenship!
          </div>
        ) : citizenship.citizenshipDate ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Estimated date: {citizenship.citizenshipDate.toLocaleDateString()}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
