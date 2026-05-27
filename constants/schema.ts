import * as z from "zod";

export const LoginSchema = z.object({
    email: z.email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(12, { message: "Password must be at least 12 characters" })
      .refine((val) => /[A-Z]/.test(val), {
        message: "Must contain at least one uppercase letter",
      })
      .refine((val) => /[0-9]/.test(val), {
        message: "Must contain at least one number",
      }),
  });

export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const SignUpSchema = z.object({
    userName: z
      .string()
      .min(3, { message: "User name must be at least 3 characters" }),
    email: z.email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(12, { message: "Password must be at least 12 characters" })
      .refine((val) => /[A-Z]/.test(val), {
        message: "Must contain at least one uppercase letter",
      })
      .refine((val) => /[0-9]/.test(val), {
        message: "Must contain at least one number",
      }),
  });

  export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

  export const AuthResponseSchema = z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
  });
  export type AuthResponseType = z.infer<typeof AuthResponseSchema>;