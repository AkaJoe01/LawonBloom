import { z } from "zod";
import { emailSchema, optionalPhone, optionalText } from "./common";

export const consultationSchema = z.object({
  doctor: z.string().trim().min(2).max(120),
  date: z.string().trim().min(3).max(40),
  time: z.string().trim().min(3).max(20),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  email: emailSchema,
  phone: optionalPhone(),
  notes: optionalText(2000),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
