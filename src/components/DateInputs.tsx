import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRecoilState } from "recoil";
import { useEffect } from "react";
import { prStartDateAtom, tmpStartDateAtom } from "../store/atoms";
import { dateFormSchema, type DateFormData } from "../schemas/forms";

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

  // Reset form when Recoil state changes (e.g., from import)
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
    <div className="input-group">
      <h3>📅 Important Dates</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="prStartDate">PR Start Date:</label>
          <input
            type="date"
            id="prStartDate"
            {...register("prStartDate")}
            onChange={(e) => {
              setPrStartDate(e.target.value);
            }}
          />
          {errors.prStartDate && (
            <span className="error">{errors.prStartDate.message}</span>
          )}
        </div>

        <div>
          <label htmlFor="tmpStartDate">Temporary Status Start Date:</label>
          <input
            type="date"
            id="tmpStartDate"
            {...register("tmpStartDate")}
            onChange={(e) => {
              setTempStartDate(e.target.value);
            }}
          />
          {errors.tmpStartDate && (
            <span className="error">{errors.tmpStartDate.message}</span>
          )}
        </div>
      </form>
    </div>
  );
}
