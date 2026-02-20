import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "../store/hooks";
import { addAbsence } from "../store/immigrationSlice";
import { absenceFormSchema, type AbsenceFormData } from "../schemas/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function AbsenceForm() {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AbsenceFormData>({
    resolver: zodResolver(absenceFormSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  const onSubmit = (data: AbsenceFormData) => {
    dispatch(
      addAbsence({
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description ?? "",
      })
    );
    reset();
  };

  return (
    <Card className="flex-1 min-w-[280px]">
      <CardHeader>
        <CardTitle className="text-base">Add Absence</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="absenceStart">Start Date</Label>
            <Input type="date" id="absenceStart" {...register("startDate")} />
            {errors.startDate && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="absenceEnd">End Date</Label>
            <Input type="date" id="absenceEnd" {...register("endDate")} />
            {errors.endDate && (
              <p className="text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              type="text"
              id="description"
              placeholder="e.g., Vacation, Work, Family"
              {...register("description")}
            />
          </div>

          <Button type="submit" className="w-full">
            Add Absence
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
