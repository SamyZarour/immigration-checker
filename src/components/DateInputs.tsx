import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setPrStartDate, setTmpStartDate } from "../store/immigrationSlice";
import { dateFormSchema, type DateFormData } from "../schemas/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DateInputs() {
  const dispatch = useAppDispatch();
  const prStartDate = useAppSelector((s) => s.immigration.prStartDate);
  const tmpStartDate = useAppSelector((s) => s.immigration.tmpStartDate);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DateFormData>({
    resolver: zodResolver(dateFormSchema),
    defaultValues: {
      prStartDate,
      tmpStartDate,
    },
  });

  useEffect(() => {
    reset({
      prStartDate,
      tmpStartDate,
    });
  }, [prStartDate, tmpStartDate, reset]);

  const onSubmit = (data: DateFormData) => {
    dispatch(setPrStartDate(data.prStartDate));
    dispatch(setTmpStartDate(data.tmpStartDate));
  };

  return (
    <Card className="flex-1 min-w-[280px]">
      <CardHeader>
        <CardTitle className="text-base">Important Dates</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="prStartDate">PR Start Date</Label>
            <Input
              type="date"
              id="prStartDate"
              {...register("prStartDate")}
              onChange={(e) => dispatch(setPrStartDate(e.target.value))}
            />
            {errors.prStartDate && (
              <p className="text-sm text-destructive">
                {errors.prStartDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tmpStartDate">Temporary Status Start Date</Label>
            <Input
              type="date"
              id="tmpStartDate"
              {...register("tmpStartDate")}
              onChange={(e) => dispatch(setTmpStartDate(e.target.value))}
            />
            {errors.tmpStartDate && (
              <p className="text-sm text-destructive">
                {errors.tmpStartDate.message}
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
