import { z } from "zod";

export const registerUserSchema = z.object({
  email: z.string().email("Email must be a valid email address"),
  fullName: z.string().min(1, "Full name is required"),
  department: z.string().min(1).optional(),
  managerId: z.string().min(1).optional(),
  lrUserId: z.string().min(1, "LoginRadius user id is required"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

/**
 * Admin edits to the fields this app owns. Both are nullable so a finance admin
 * can clear a department or detach a manager; omitted keys are left untouched.
 */
export const updateUserProfileSchema = z
  .object({
    department: z.string().min(1).nullable().optional(),
    managerId: z.string().min(1).nullable().optional(),
  })
  .refine((v) => v.department !== undefined || v.managerId !== undefined, {
    message: "Provide at least one of department or managerId",
  });

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
