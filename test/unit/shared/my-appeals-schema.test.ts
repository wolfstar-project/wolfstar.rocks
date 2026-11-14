import { MyAppealsQuerySchema } from "#shared/schemas/my-appeals";
import { safeParse } from "valibot";
import { describe, expect, it } from "vitest";

describe("MyAppealsQuerySchema", () => {
	it("reads the server a banned member comes from, or none", () => {
		expect(safeParse(MyAppealsQuerySchema, {})).toMatchObject({
			success: true,
			output: {},
		});
		expect(safeParse(MyAppealsQuerySchema, { guild: "123456789012345678" })).toMatchObject({
			success: true,
			output: { guild: "123456789012345678" },
		});
	});

	it("refuses a server that is no Discord ID, or more than one", () => {
		for (const guild of ["not-a-snowflake", "", "123", ["123456789012345678"]]) {
			expect(safeParse(MyAppealsQuerySchema, { guild }).success).toBe(false);
		}
	});
});
