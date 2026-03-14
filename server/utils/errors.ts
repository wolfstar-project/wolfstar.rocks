// Server/utils/errors.ts
import { createError } from "evlog";

export const errors = {
	notFound: (resource: string) =>
		createError({
			message: `${resource} not found`,
			status: 404,
		}),

	unauthorized: () =>
		createError({
			message: "Please log in to continue",
			status: 401,
			fix: "Sign in to your account",
		}),

	validation: (field: string, issue: string) =>
		createError({
			message: `Invalid ${field}`,
			status: 400,
			why: issue,
			fix: `Please provide a valid ${field}`,
		}),
};
