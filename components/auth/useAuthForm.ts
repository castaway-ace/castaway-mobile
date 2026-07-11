import { zodErrorMap } from "@/constants/validation";
import { useState } from "react";
import * as z from "zod";

export const useAuthForm = <Schema extends z.ZodType>(schema: Schema) => {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (values: z.input<Schema>): z.output<Schema> | null => {
    const result = schema.safeParse(values);
    if (!result.success) {
      setErrors(zodErrorMap(result.error));
      return null;
    }
    return result.data;
  };

  return { errors, clearError, validate };
};
