import { MemberSearchQuerySchema } from "#shared/schemas/member-search";
import { safeParse } from "valibot";
import { describe, expect, it } from "vitest";

const SNOWFLAKE = "200000000000000001";

describe("MemberSearchQuerySchema", () => {
	it("trims a name query", () => {
		const result = safeParse(MemberSearchQuerySchema, { query: " ab " });
		expect(result.success && result.output).toEqual({ query: "ab" });
	});

	it("refuses an empty or too long query", () => {
		expect(safeParse(MemberSearchQuerySchema, { query: "" }).success).toBe(false);
		expect(safeParse(MemberSearchQuerySchema, { query: "a".repeat(101) }).success).toBe(false);
	});

	it("reads a list of ids", () => {
		const result = safeParse(MemberSearchQuerySchema, {
			ids: `${SNOWFLAKE},200000000000000002`,
		});
		expect(result.success && result.output).toEqual({
			ids: [SNOWFLAKE, "200000000000000002"],
		});
	});

	it("refuses a list with a non-snowflake or more than 25 ids", () => {
		expect(safeParse(MemberSearchQuerySchema, { ids: "nope" }).success).toBe(false);
		const many = Array.from({ length: 26 }, (_, index) =>
			String(200000000000000000n + BigInt(index)),
		);
		expect(safeParse(MemberSearchQuerySchema, { ids: many.join(",") }).success).toBe(false);
	});
});
