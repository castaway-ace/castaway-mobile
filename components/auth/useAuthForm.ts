import { zodErrorMap } from "@/constants/validation";
import { useState } from "react";
import * as z from "zod";

/**
 * Reusable validation state for the login and signup forms, driven by a Zod
 * schema.
 *
 * @remarks
 * Generic over the schema so login and signup share the same field-error
 * plumbing while each keeps its own rules. `validate` returns the parsed,
 * fully-typed values on success or `null` on failure (populating per-field
 * `errors` as a side effect), letting callers write
 * `const data = validate(...); if (!data) return;` and get a typed result.
 * `clearError` lets a field drop its own error as the user edits it, so stale
 * messages don't linger.
 *
 * @param schema - The Zod schema to validate against.
 */
export const useAuthForm = <Schema extends z.ZodType>(schema: Schema) => {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (values: z.input<Schema>): z.output<Schema> | null => {
    const result = schema.safeParse(values);
    if (!result.success) {
      // Flatten Zod's issues into a { field: message } map for the inputs.
      setErrors(zodErrorMap(result.error));
      return null;
    }
    return result.data;
  };

  return { errors, clearError, validate };
};
