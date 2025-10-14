import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const otpSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().length(6),
});

export const requestResetSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().length(6),
  password: z.string().min(8).max(128),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  branch: z.string().max(40).optional(),
  year: z.number().int().min(1).max(6).nullable().optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().url().optional(),
  residence: z.enum(["hosteller", "day_scholar", ""]).optional(),
});
