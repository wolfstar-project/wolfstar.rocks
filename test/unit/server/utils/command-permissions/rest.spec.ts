import { commandPermissionsRest } from "#server/utils/command-permissions/rest";
import { describe, expect, it } from "vitest";

describe("commandPermissionsRest", () => {
	it("rejects a rate limit on the application routes instead of waiting it out", async () => {
		const { rejectOnRateLimit } = commandPermissionsRest().options;
		expect(rejectOnRateLimit).toBeDefined();
		const limited =
			typeof rejectOnRateLimit === "function"
				? await rejectOnRateLimit({
						route: "/applications/:id/guilds/:id/commands/:id/permissions",
					} as never)
				: rejectOnRateLimit?.some((prefix) =>
						"/applications/:id/guilds/:id/commands/:id/permissions".startsWith(prefix),
					);
		expect(limited).toBe(true);
	});
});
