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
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.output.limit).toBe(30);
			expect(result.output.offset).toBe(0);
		}
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
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.output.userId).toBeUndefined();
			expect(result.output.moderatorId).toBeUndefined();
		}
	});
});

describe("CommandLogQuerySchema", () => {
	it("accepts empty object with defaults", () => {
		const result = safeParse(CommandLogQuerySchema, {});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.output.limit).toBe(30);
			expect(result.output.success).toBe("all");
		}
	});

	it("rejects negative offset", () => {
		const result = safeParse(CommandLogQuerySchema, { offset: "-5" });
		expect(result.success).toBe(false);
	});
});

describe("DashboardActivityQuerySchema", () => {
	it("accepts empty object with defaults", () => {
		const result = safeParse(DashboardActivityQuerySchema, {});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.output.limit).toBe(10);
		}
	});

	it("rejects limit above 100", () => {
		const result = safeParse(DashboardActivityQuerySchema, { limit: "200" });
		expect(result.success).toBe(false);
	});
});
