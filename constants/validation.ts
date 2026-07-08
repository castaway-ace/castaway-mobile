import * as z from "zod";

export const zodErrorMap = (error: z.ZodError): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    map[issue.path.join(".")] = issue.message;
  }
  return map;
};

export const PASSWORD_RULES: {
  label: string;
  test: (value: string) => boolean;
}[] = [
  { label: "At least 12 characters", test: (v) => v.length >= 12 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
];

const passwordSchema: z.ZodType<string> = PASSWORD_RULES.reduce<
  z.ZodType<string>
>((schema, rule) => schema.refine(rule.test, { message: rule.label }), z.string());

export const LoginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const SignUpSchema = z.object({
  userName: z
    .string()
    .min(3, { message: "User name must be at least 3 characters" }),
  email: z.email({ message: "Please enter a valid email address" }),
  password: passwordSchema,
});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});
export type AuthResponseType = z.infer<typeof AuthResponseSchema>;