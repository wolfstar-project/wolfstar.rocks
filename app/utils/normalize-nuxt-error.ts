import { isNullOrUndefinedOrEmpty, isNullOrUndefinedOrZero } from "@sapphire/utilities";

export interface NuxtErrorShape {
	statusCode: number;
	statusMessage: string;
	message: string;
}

export function normalizeToNuxtError(
	error: unknown,
	fallback: { statusCode: number; statusMessage: string; message: string },
): NuxtErrorShape {
	// Handle falsy values (null, undefined, false, 0, "")
	if (isNullOrUndefinedOrZero(error) || isNullOrUndefinedOrEmpty(error) || error === false) {
		return { ...fallback };
	}

	// Handle standard Error objects
	if (error instanceof Error) {
		const err = error as any;
		// Prefer existing status code
		const statusCode = err.statusCode || err.status || fallback.statusCode;
		const statusMessage = err.statusMessage || err.statusText || fallback.statusMessage;
		// Prefer error message over fallback if present
		const message = err.message || fallback.message;

		return {
			statusCode,
			statusMessage,
			message,
		};
	}

	// Handle plain objects that might look like errors or unknown objects
	if (typeof error === "object") {
		const err = error as any;
		const potentialStatusCode = err.statusCode || err.status;
		const potentialStatusMessage = err.statusMessage || err.statusText;
		const potentialMessage = err.message;

		// If at least one known property is present, try to use them
		if (potentialStatusCode || potentialStatusMessage || potentialMessage) {
			return {
				statusCode: potentialStatusCode || fallback.statusCode,
				statusMessage: potentialStatusMessage || fallback.statusMessage,
				message: potentialMessage || fallback.message,
			};
		}

		// Completely unknown object -> try to stringify
		try {
			const stringified = JSON.stringify(error);
			// If it's empty object stringification or just brackets, fallback to message
			if (stringified === "{}") {
				return {
					...fallback,
					message: fallback.message,
				};
			}
			return {
				...fallback,
				message: stringified,
			};
		} catch {
			// Circle ref or serialization error
			return { ...fallback };
		}
	}

	// Handle strings
	if (typeof error === "string") {
		return {
			...fallback,
			message: error,
		};
	}

	// Handle numbers or other primitives
	if (typeof error === "number") {
		return {
			...fallback,
			message: String(error),
		};
	}

	// Fallback for symbols/functions/unexpected types
	return { ...fallback };
}
