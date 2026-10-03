import { z } from "zod";
import { emailSchema } from "./common";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(256),
  totp: z
    .string()
    .regex(/^\d{6}$|^[A-Z0-9]{10}$/, "code must be 6 digits or a 10-char backup code")
    .optional(),
});

export const totpVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, "code must be 6 digits"),
});

export const backupRedeemSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{10}$/, "code must be 10 characters"),
});

export const userCreateSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(2).max(120),
});

export const userActionSchema = z.object({
  action: z.enum(["deactivate", "activate", "reset-password"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type TotpVerifyInput = z.infer<typeof totpVerifySchema>;
export type BackupRedeemInput = z.infer<typeof backupRedeemSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserActionInput = z.infer<typeof userActionSchema>;
