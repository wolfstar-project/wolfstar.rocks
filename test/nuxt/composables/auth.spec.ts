import { describe, expect, it } from "vitest";

describe("guildAddURL", () => {
	it("should return a Discord OAuth2 authorize URL", () => {
		const url = guildAddURL("123456789");
		expect(url).toContain("https://discord.com/oauth2/authorize");
	});

	it("should include the guild_id parameter", () => {
		const url = guildAddURL("987654321");
		expect(url).toContain("guild_id=987654321");
	});

	it("should include a client_id parameter", () => {
		const url = guildAddURL("123");
		expect(url).toMatch(/client_id=\w+/);
	});

	it("should include the correct permissions", () => {
		const url = guildAddURL("123");
		expect(url).toContain("permissions=491121748");
	});

	it("should include bot and command scopes", () => {
		const url = guildAddURL("123");
		expect(url).toContain("scope=bot");
		expect(url).toContain("applications.commands");
	});

	it("should lock the install to the selected guild", () => {
		const url = guildAddURL("123");
		expect(url).toContain("disable_guild_select=true");
		expect(url).toContain("integration_type=0");
	});

	it("should not force a non-interactive code grant flow", () => {
		const url = guildAddURL("123");
		const parsedUrl = new URL(url);

		expect(parsedUrl.searchParams.has("prompt")).toBe(false);
		expect(parsedUrl.searchParams.has("response_type")).toBe(false);
		expect(parsedUrl.searchParams.has("redirect_uri")).toBe(false);
	});
});

describe("resolveClientUser", () => {
	it("should delegate to $authorization.resolveClientUser()", () => {
		const app = useNuxtApp();
		const expectedUser = { id: "test-user", name: "Test" };

		app.provide("authorization", {
			resolveClientUser: () => expectedUser,
		});

		expect(resolveClientUser()).toEqual(expectedUser);
	});
});
