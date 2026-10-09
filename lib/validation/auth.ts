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

export const userActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.enum(["deactivate", "activate", "reset-password"]) }),
  z.object({ action: z.literal("set-role"), role: z.enum(["ADMIN", "EDITOR"]) }),
]);

export const accountUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    currentPassword: z.string().min(1).max(256).optional(),
    newPassword: z.string().min(12).max(256).optional(),
  })
  .refine((value) => value.name !== undefined || value.newPassword !== undefined, {
    message: "Nothing to update.",
    path: ["name"],
  })
  .refine((value) => !value.newPassword || value.currentPassword !== undefined, {
    message: "Enter your current password.",
    path: ["currentPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type TotpVerifyInput = z.infer<typeof totpVerifySchema>;
export type BackupRedeemInput = z.infer<typeof backupRedeemSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserActionInput = z.infer<typeof userActionSchema>;
