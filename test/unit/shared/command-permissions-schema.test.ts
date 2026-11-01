import { CommandPermissionsPutSchema } from "#shared/schemas/command-permissions";
import { safeParse } from "valibot";
import { describe, expect, it } from "vitest";

const row = (index: number, type = 1) => ({
	id: String(300000000000000000n + BigInt(index)),
	type,
	permission: true,
});

describe("CommandPermissionsPutSchema", () => {
	it("takes up to 100 rows with a snapshot", () => {
		const rows = Array.from({ length: 100 }, (_, index) => row(index));
		expect(
			safeParse(CommandPermissionsPutSchema, { snapshot: "[]", permissions: rows }).success,
		).toBe(true);
	});

	it("refuses 101 rows", () => {
		const rows = Array.from({ length: 101 }, (_, index) => row(index));
		expect(
			safeParse(CommandPermissionsPutSchema, { snapshot: "[]", permissions: rows }).success,
		).toBe(false);
	});

	it("refuses an unknown row type and a non-snowflake id", () => {
		expect(
			safeParse(CommandPermissionsPutSchema, { snapshot: "[]", permissions: [row(1, 4)] })
				.success,
		).toBe(false);
		expect(
			safeParse(CommandPermissionsPutSchema, {
				snapshot: "[]",
				permissions: [{ id: "nope", type: 1, permission: true }],
			}).success,
		).toBe(false);
	});
});
