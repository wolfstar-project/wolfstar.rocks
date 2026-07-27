import {
	ModerationLogQuerySchema,
	CommandLogQuerySchema,
	DashboardActivityQuerySchema,
} from "#shared/schemas/log-queries";
import { safeParse } from "valibot";
import { describe, expect, it } from "vitest";

describe("ModerationLogQuerySchema", () => {
	it("accepts empty object with defaults", () => {
		const result = safeParse(ModerationLogQuerySchema, {});
		expect(result).toMatchObject({
			success: true,
			output: { limit: 30, offset: 0 },
		});
	});

	it("rejects negative offset", () => {
		const result = safeParse(ModerationLogQuerySchema, { offset: "-1" });
		expect(result.success).toBe(false);
	});

	it("rejects limit above 100", () => {
		const result = safeParse(ModerationLogQuerySchema, { limit: "101" });
		expect(result.success).toBe(false);
	});

	it("rejects q longer than 200 chars", () => {
		const result = safeParse(ModerationLogQuerySchema, { q: "a".repeat(201) });
		expect(result.success).toBe(false);
	});

	it("accepts omitted optional fields", () => {
		const result = safeParse(ModerationLogQuerySchema, { limit: "10" });
		expect(result).toMatchObject({
			success: true,
			output: { limit: 10, offset: 0 },
		});
		// Valibot omits absent optional keys rather than setting them to undefined.
		expect(result.output).not.toHaveProperty("userId");
		expect(result.output).not.toHaveProperty("moderatorId");
	});
});

describe("CommandLogQuerySchema", () => {
	it("accepts empty object with defaults", () => {
		const result = safeParse(CommandLogQuerySchema, {});
		expect(result).toMatchObject({
			success: true,
			output: { limit: 30, success: "all" },
		});
	});

	it("rejects negative offset", () => {
		const result = safeParse(CommandLogQuerySchema, { offset: "-5" });
		expect(result.success).toBe(false);
	});
});

describe("DashboardActivityQuerySchema", () => {
	it("accepts empty object with defaults", () => {
		const result = safeParse(DashboardActivityQuerySchema, {});
		expect(result).toMatchObject({
			success: true,
			output: { limit: 10 },
		});
	});

	it("rejects limit above 100", () => {
		const result = safeParse(DashboardActivityQuerySchema, { limit: "200" });
		expect(result.success).toBe(false);
	});
});
