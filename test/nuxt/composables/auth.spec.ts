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

	it("should include a redirect_uri ending with /oauth/guild", () => {
		const url = guildAddURL("123");
		expect(url).toMatch(/redirect_uri=.*%2Foauth%2Fguild/);
	});

	it("should include scope=bot", () => {
		const url = guildAddURL("123");
		expect(url).toContain("scope=bot");
	});

	it("should include response_type=code", () => {
		const url = guildAddURL("123");
		expect(url).toContain("response_type=code");
	});

	it("should include prompt=none", () => {
		const url = guildAddURL("123");
		expect(url).toContain("prompt=none");
	});
});

describe("resolveClientUser", () => {
	it("should delegate to $authorization.resolveClientUser()", () => {
		const result = resolveClientUser();
		// The function delegates to the authorization plugin; in test env it returns the resolved client user
		expect(result).toBeDefined();
	});
});
