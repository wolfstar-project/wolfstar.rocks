import {
	ModerationLogQuerySchema,
	CommandLogQuerySchema,
	DashboardActivityQuerySchema,
} from "#shared/schemas/log-queries";
import { safeParse } from "valibot";
import { describe, expect, it } from "vitest";

describe("snowflake filters", () => {
	// The routes convert these with `BigInt()`, which throws on anything
	// non-numeric, so a malformed filter must fail validation (400), not the handler (500).
	it("accept a numeric Discord snowflake", () => {
		expect(safeParse(ModerationLogQuerySchema, { userId: "123456789012345678" }).success).toBe(
			true,
		);
		expect(safeParse(CommandLogQuerySchema, { userId: " 123456789012345678 " })).toMatchObject({
			success: true,
			output: { userId: "123456789012345678" },
		});
		expect(
			safeParse(DashboardActivityQuerySchema, { actorId: "9223372036854775807" }).success,
		).toBe(true);
	});

	it("reject non-numeric or oversized ids", () => {
		expect(
			safeParse(ModerationLogQuerySchema, { moderatorId: "not-a-snowflake" }).success,
		).toBe(false);
		expect(
			safeParse(CommandLogQuerySchema, { userId: "12345678901234567890123" }).success,
		).toBe(false);
		expect(safeParse(DashboardActivityQuerySchema, { actorId: "1e5" }).success).toBe(false);
		expect(safeParse(DashboardActivityQuerySchema, { actorId: "42" }).success).toBe(false);
	});

	// The columns are `BIGINT`: a 19-digit value above its range has the right
	// shape and would only fail inside the query.
	it("reject an id a BIGINT column cannot hold", () => {
		expect(safeParse(ModerationLogQuerySchema, { userId: "9223372036854775808" }).success).toBe(
			false,
		);
	});
});

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

describe("date filters", () => {
	const parseFrom = (from: string) => safeParse(DashboardActivityQuerySchema, { from });

	it("normalize a date or date-time to UTC", () => {
		expect(parseFrom("2026-10-09").output).toMatchObject({ from: "2026-10-09T00:00:00.000Z" });
		expect(parseFrom("2026-10-09T21:02:50.123Z").output).toMatchObject({
			from: "2026-10-09T21:02:50.123Z",
		});
	});

	it("apply an offset instead of leaving it for the database to drop", () => {
		expect(parseFrom("2026-10-09T21:02:50+02:00").output).toMatchObject({
			from: "2026-10-09T19:02:50.000Z",
		});
	});

	it("read a date-time without a zone as UTC", () => {
		expect(parseFrom("2026-10-09T21:02:50").output).toMatchObject({
			from: "2026-10-09T21:02:50.000Z",
		});
	});

	it("reject text that is not an ISO date", () => {
		for (const from of ["yesterday", "2026-13-45", "09/10/2026", "2026-10-09T99:00:00Z"]) {
			expect(parseFrom(from).success).toBe(false);
		}
	});
});
