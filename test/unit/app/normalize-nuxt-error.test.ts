import { describe, expect, it } from "vitest";
import { normalizeToNuxtError } from "../../../app/utils/normalize-nuxt-error";

describe(normalizeToNuxtError, () => {
	const fallback = {
		statusCode: 500,
		statusMessage: "Internal Server Error",
		message: "An unexpected error occurred",
	};

	it("normalizes a FetchError-like object (with status)", () => {
		const error = {
			status: 404,
			statusText: "Not Found",
			message: "Resource not found",
		};
		const result = normalizeToNuxtError(error, fallback);
		expect(result).toEqual({
			statusCode: 404,
			statusMessage: "Not Found",
			message: "Resource not found",
		});
	});

	it("normalizes a FetchError-like object (with statusCode)", () => {
		const error = {
			statusCode: 403,
			statusMessage: "Forbidden",
			message: "Access denied",
		};
		const result = normalizeToNuxtError(error, fallback);
		expect(result).toEqual({
			statusCode: 403,
			statusMessage: "Forbidden",
			message: "Access denied",
		});
	});

	it("preserves existing Nuxt-like error properties", () => {
		const error = {
			statusCode: 400,
			statusMessage: "Bad Request",
			message: "Invalid input",
		};
		const result = normalizeToNuxtError(error, fallback);
		expect(result).toEqual(error);
	});

	it("normalizes a plain Error object", () => {
		const error = new Error("Something went wrong");
		const result = normalizeToNuxtError(error, fallback);
		expect(result).toEqual({
			statusCode: 500, // Should use fallback status code
			statusMessage: "Internal Server Error", // Should use fallback status message
			message: "Something went wrong", // Should use error message
		});
	});

	it("normalizes a string error", () => {
		const error = "String error message";
		const result = normalizeToNuxtError(error, fallback);
		expect(result).toEqual({
			...fallback,
			message: "String error message",
		});
	});

	it("normalizes a number error", () => {
		const error = 418;
		const result = normalizeToNuxtError(error, fallback);
		expect(result).toEqual({
			...fallback,
			statusCode: 418, // Treat number as status code if plausible? Or just fallback?
			// Let's assume broad "unknown" behavior for now, but maybe explicit handling for number is good.
			// Actually, if it's just a number, we probably can't assume it's a status code unless we decide to.
			// For safety, let's say it uses fallback but maybe puts stringified number in message?
			// Re-reading requirements: "Handle unknown types with fallback".
			// If I pass 418, it's not an object with status/statusCode, nor an Error.
			// The safest bet is fallback structure with stringified message.
			message: "418",
		});
	});

	it("handles null", () => {
		const result = normalizeToNuxtError(null, fallback);
		expect(result).toEqual(fallback);
	});

	it("handles undefined", () => {
		const result = normalizeToNuxtError(undefined, fallback);
		expect(result).toEqual(fallback);
	});

	it("handles unknown object types without status/message", () => {
		const error = { foo: "bar" };
		const result = normalizeToNuxtError(error, fallback);
		expect(result).toEqual({
			...fallback,
			message: '{"foo":"bar"}',
		});
	});

	it("handles empty object as fallback", () => {
		const error = {};
		const result = normalizeToNuxtError(error, fallback);
		expect(result).toEqual(fallback);
	});

	it("prioritizes extensive error properties over fallback", () => {
		const error = {
			status: 401,
			// Missing statusMessage/message
		};
		const result = normalizeToNuxtError(error, fallback);
		expect(result).toEqual({
			statusCode: 401,
			statusMessage: fallback.statusMessage,
			message: fallback.message,
		});
	});
});
