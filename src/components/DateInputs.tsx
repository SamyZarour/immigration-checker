import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRecoilState } from "recoil";
import { useEffect } from "react";
import { prStartDateAtom, tmpStartDateAtom } from "../store/atoms";
import { dateFormSchema, type DateFormData } from "../schemas/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DateInputs() {
  const [prStartDate, setPrStartDate] = useRecoilState(prStartDateAtom);
  const [tmpStartDate, setTempStartDate] = useRecoilState(tmpStartDateAtom);

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
    setPrStartDate(data.prStartDate);
    setTempStartDate(data.tmpStartDate);
  };

  return (
    <Card className="flex-1 min-w-[280px]">
      <CardHeader>
        <CardTitle className="text-base">Important Dates</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prStartDate">PR Start Date</Label>
            <Input
              type="date"
              id="prStartDate"
              {...register("prStartDate")}
              onChange={(e) => setPrStartDate(e.target.value)}
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
              onChange={(e) => setTempStartDate(e.target.value)}
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
