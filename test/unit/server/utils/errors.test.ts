import { errors } from "#server/utils/errors";
import { describe, expect, it } from "vitest";

describe("errors", () => {
	describe("notFound", () => {
		it("should create a 404 error with resource name", () => {
			const error = errors.notFound("Guild");
			expect(error.message).toBe("Guild not found");
			expect(error.status).toBe(404);
		});

		it("should include different resource names", () => {
			const error = errors.notFound("User");
			expect(error.message).toBe("User not found");
		});
	});

	describe("unauthorized", () => {
		it("should create a 401 error", () => {
			const error = errors.unauthorized();
			expect(error.message).toBe("Please log in to continue");
			expect(error.status).toBe(401);
		});
	});

	describe("validation", () => {
		it("should create a 400 error with field and issue", () => {
			const error = errors.validation("email", "must be a valid email address");
			expect(error.message).toBe("Invalid email");
			expect(error.status).toBe(400);
		});

		it("should include different field names", () => {
			const error = errors.validation("guildId", "must be a valid snowflake");
			expect(error.message).toBe("Invalid guildId");
		});
	});
});
