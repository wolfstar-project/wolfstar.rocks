import type { ValidationError as YupError, ObjectSchema as YupObjectSchema } from "yup";
import type { FormSchema, ValidateReturnSchema } from "@/types/form";

export function isYupSchema(schema: any): schema is YupObjectSchema<any> {
  return schema.validate && schema.__isYupSchema__;
}

export function isYupError(error: any): error is YupError {
  return error.inner !== undefined;
}

async function validateYupSchema(
  state: any,
  schema: YupObjectSchema<any>,
): Promise<ValidateReturnSchema<typeof state>> {
  try {
    const result = await schema.validate(state, { abortEarly: false });
    return {
      errors: null,
      result,
    };
  }
  catch (error) {
    if (isYupError(error)) {
      const errors = error.inner.map(issue => ({
        name: issue.path ?? "",
        message: issue.message,
      }));

      return {
        errors,
        result: null,
      };
    }
    else {
      throw error;
    }
  }
}

export function validateSchema<T extends object>(state: T, schema: FormSchema<T>): Promise<ValidateReturnSchema<typeof state>> {
  if (isYupSchema(schema)) {
    return validateYupSchema(state, schema);
  }
  else {
    throw new Error("Form validation failed: Unsupported form schema");
  }
}
