import { z } from "zod";

export const dateFormSchema = z.object({
  prStartDate: z.string().min(1, "PR start date is required"),
  tmpStartDate: z.string().min(1, "Temporary status start date is required"),
});

const absenceSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string(),
});

export const absenceFormSchema = absenceSchema
  .extend({ description: z.string().optional() })
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

export const savedDataSchema = z.object({
  prStartDate: z.string().min(1, "PR start date is required"),
  tmpStartDate: z.string().min(1, "Temporary start date is required"),
  absences: z.array(absenceSchema),
});

export type DateFormData = z.infer<typeof dateFormSchema>;
export type AbsenceFormData = z.infer<typeof absenceFormSchema>;
export type SavedDataSchema = z.infer<typeof savedDataSchema>;
