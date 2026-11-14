import { UserSettingsUpdateSchema } from "#shared/schemas/user-settings";
import { safeParse } from "valibot";
import { describe, expect, it } from "vitest";

describe("UserSettingsUpdateSchema", () => {
	it("takes the moderation direct messages switch", () => {
		expect(safeParse(UserSettingsUpdateSchema, { report: false })).toMatchObject({
			output: { report: false },
			success: true,
		});
	});

	it("refuses anything but a boolean", () => {
		expect(safeParse(UserSettingsUpdateSchema, { report: "no" }).success).toBe(false);
		expect(safeParse(UserSettingsUpdateSchema, {}).success).toBe(false);
	});
});
