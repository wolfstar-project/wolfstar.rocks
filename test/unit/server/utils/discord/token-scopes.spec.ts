import { readTokenScopes } from "#server/utils/discord/token-scopes";
import { describe, expect, it, vi } from "vitest";

const TOKEN = "secret-user-token";

describe("readTokenScopes", () => {
	it("asks Discord with the bearer token and returns the scopes", async () => {
		const fetcher = vi.fn(async () => ({
			scopes: ["identify", "applications.commands.permissions.update"],
		}));

		const scopes = await readTokenScopes(TOKEN, fetcher);

		expect(scopes).toEqual(["identify", "applications.commands.permissions.update"]);
		expect(fetcher).toHaveBeenCalledWith("https://discord.com/api/v10/oauth2/@me", {
			headers: { Authorization: `Bearer ${TOKEN}` },
		});
	});

	it("reads no scope when Discord refuses the token", async () => {
		const fetcher = vi.fn(async () => {
			throw Object.assign(new Error("Unauthorized"), { status: 401 });
		});
		await expect(readTokenScopes(TOKEN, fetcher)).resolves.toEqual([]);
	});

	it("never writes the token to the console", async () => {
		const spies = (["log", "info", "warn", "error", "debug"] as const).map((method) =>
			vi.spyOn(console, method).mockImplementation(() => {}),
		);
		await readTokenScopes(
			TOKEN,
			vi.fn(async () => Promise.reject(new Error(`bad ${TOKEN}`))),
		);
		for (const spy of spies) {
			for (const call of spy.mock.calls) expect(JSON.stringify(call)).not.toContain(TOKEN);
			spy.mockRestore();
		}
	});
});
