import { z } from "zod"

/**
 * User authentication validation schemas
 */
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type SignUpInput = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type SignInInput = z.infer<typeof signInSchema>

/**
 * User profile validation schemas
 */
export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must not exceed 100 characters")
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must not exceed 500 characters")
    .optional(),
  therapyFocus: z
    .array(z.string())
    .max(5, "Select at most 5 therapy focuses")
    .optional(),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

/**
 * Session/Message validation schemas
 */
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must not exceed 5000 characters"),
  sessionId: z.string().min(1, "Session ID is required"),
})

export type MessageInput = z.infer<typeof messageSchema>

export const sessionCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),
})

export type SessionCreateInput = z.infer<typeof sessionCreateSchema>

/**
 * Validation helper function
 */
export async function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: boolean; data?: T; errors?: Record<string, string> }> {
  try {
    const validated = await schema.parseAsync(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join(".")
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: "Validation failed" } }
  }
}
