import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRecoilState } from "recoil";
import { absencesAtom } from "../store/atoms";
import { absenceFormSchema, type AbsenceFormData } from "../schemas/forms";

export function AbsenceForm() {
  const [, setAbsences] = useRecoilState(absencesAtom);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AbsenceFormData>({
    resolver: zodResolver(absenceFormSchema),
  });

  const onSubmit = (data: AbsenceFormData) => {
    const newAbsence = {
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description || "",
    };

    setAbsences((prev) => [...prev, newAbsence]);
    reset();
  };

  return (
    <div className="input-group">
      <h3>➕ Add Absence</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="absenceStart">Start Date:</label>
          <input type="date" id="absenceStart" {...register("startDate")} />
          {errors.startDate && (
            <span className="error">{errors.startDate.message}</span>
          )}
        </div>

        <div>
          <label htmlFor="absenceEnd">End Date:</label>
          <input type="date" id="absenceEnd" {...register("endDate")} />
          {errors.endDate && (
            <span className="error">{errors.endDate.message}</span>
          )}
        </div>

        <div>
          <label htmlFor="description">Description (optional):</label>
          <input
            type="text"
            id="description"
            placeholder="e.g., Vacation, Work, Family"
            {...register("description")}
          />
        </div>

        <button type="submit" className="btn btn-success">
          Add Absence
        </button>
      </form>
    </div>
  );
}
