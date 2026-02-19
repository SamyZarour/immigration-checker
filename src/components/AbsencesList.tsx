import { useRecoilState } from "recoil";
import { absencesAtom } from "../store/atoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

export function AbsencesList() {
  const [absences, setAbsences] = useRecoilState(absencesAtom);

  const removeAbsence = (index: number) => {
    setAbsences((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recorded Absences</CardTitle>
      </CardHeader>
      <CardContent>
        {absences.length === 0 ? (
          <p className="text-sm text-muted-foreground">No absences recorded</p>
        ) : (
          <div className="space-y-0">
            {absences.map((absence, index) => (
              <div key={index}>
                {index > 0 && <Separator />}
                <div className="flex items-center justify-between py-3">
                  <div className="text-sm">
                    <span className="font-medium">{absence.startDate}</span>
                    <span className="text-muted-foreground"> to </span>
                    <span className="font-medium">{absence.endDate}</span>
                    {absence.description && (
                      <span className="ml-2 text-muted-foreground">
                        ({absence.description})
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeAbsence(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
