import * as z from "zod";

/**
 * Flattens a Zod error into a `{ field: message }` map for the auth forms.
 *
 * @remarks
 * Joins nested issue paths with `.` so the key matches the form field name. Used
 * by {@link useAuthForm} to drive per-field error text.
 */
export const zodErrorMap = (error: z.ZodError): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    map[issue.path.join(".")] = issue.message;
  }
  return map;
};

/**
 * The password requirements, as `{ label, test }` pairs.
 *
 * @remarks
 * The single source of truth for password strength: both the live checklist
 * ({@link PasswordRequirements}) and the signup schema below are derived from
 * this array, so the rules a user sees can never drift from the rules actually
 * enforced. Add a rule here and both update.
 */
export const PASSWORD_RULES: {
  label: string;
  test: (value: string) => boolean;
}[] = [
  { label: "At least 12 characters", test: (v) => v.length >= 12 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
];

// Fold each rule into a chain of refinements so a failing rule reports its own
// label as the message — keeping schema errors worded identically to the checklist.
const passwordSchema: z.ZodType<string> = PASSWORD_RULES.reduce<
  z.ZodType<string>
>((schema, rule) => schema.refine(rule.test, { message: rule.label }), z.string());

/**
 * Login form schema.
 *
 * @remarks
 * Password is only checked for presence, not strength: existing accounts may
 * predate the current rules, and re-stating them at login would both annoy users
 * and hint at the policy. Strength is enforced at signup ({@link SignUpSchema}).
 */
export const LoginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;

/** Signup form schema — enforces the full {@link PASSWORD_RULES} via {@link passwordSchema}. */
export const SignUpSchema = z.object({
  userName: z
    .string()
    .min(3, { message: "User name must be at least 3 characters" }),
  email: z.email({ message: "Please enter a valid email address" }),
  password: passwordSchema,
});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

/**
 * Shape of a successful auth response.
 *
 * @remarks
 * Used to validate the server's login/signup payload at the trust boundary (see
 * the auth API) so malformed token responses fail loudly rather than propagating
 * as broken sessions.
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});
export type AuthResponseType = z.infer<typeof AuthResponseSchema>;