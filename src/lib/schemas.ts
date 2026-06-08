import { z } from "zod";

/**
 * Zod schemas — the single source of truth shared by React Hook Form (client)
 * and the Phase 3 server actions (server). Validate once, trust everywhere.
 */

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "That's a little too long");

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Tell us your name")
    .max(80, "That name is too long"),
  email: emailSchema,
  location: z.string().min(2, "Where are you based?").max(80),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/** A message sent to the Care Companion. */
export const companionMessageSchema = z.object({
  threadId: z.string().min(1),
  content: z.string().min(1, "Say something").max(2000),
});

export type CompanionMessageInput = z.infer<typeof companionMessageSchema>;
