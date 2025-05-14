import type { ZodSchema } from 'zod';
import type { FormSchema, ValidateReturnSchema } from '../types/form';

export function isZodSchema(schema: any): schema is ZodSchema {
	return schema.parse !== undefined;
}

async function validateZodSchema(state: any, schema: ZodSchema): Promise<ValidateReturnSchema<typeof state>> {
	const result = await schema.safeParseAsync(state);
	if (result.success === false) {
		const errors = result.error.issues.map((issue) => ({
			name: issue.path.join('.'),
			message: issue.message
		}));

		return {
			errors,
			result: null
		};
	}
	return {
		result: result.data,
		errors: null
	};
}

export function validateSchema<T extends object>(state: T, schema: FormSchema<T>): Promise<ValidateReturnSchema<typeof state>> {
	if (isZodSchema(schema)) {
		return validateZodSchema(state, schema);
	} else {
		throw new Error('Form validation failed: Unsupported form schema');
	}
}
