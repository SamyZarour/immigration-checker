import { z } from "zod";

export const dateFormSchema = z.object({
  prStartDate: z.string().min(1, "PR start date is required"),
  tmpStartDate: z.string().min(1, "Temporary status start date is required"),
});

export const absenceFormSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["endDate"],
    }
  );

export type DateFormData = z.infer<typeof dateFormSchema>;
export type AbsenceFormData = z.infer<typeof absenceFormSchema>;
