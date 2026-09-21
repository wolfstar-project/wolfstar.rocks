import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = join(process.cwd());

describe("OAuth pages view transition opt-out", () => {
	const pages = ["login.vue", "callback.vue", "guild.vue"];

	it.each(pages)("app/pages/oauth/%s has viewTransition: false", (page) => {
		const source = readFileSync(join(rootDir, "app/pages/oauth", page), "utf8");
		expect(source).toMatch(/viewTransition:\s*false/);
	});

	it("uses the callback route without a separate completion route", () => {
		const source = readFileSync(join(rootDir, "app/pages/oauth/callback.vue"), "utf8");

		expect(source).not.toContain("/oauth/complete");
	});

	it("bridges Discord codes to the bot API oauth/callback", () => {
		const source = readFileSync(join(rootDir, "app/pages/oauth/callback.vue"), "utf8");

		expect(source).toContain("completeBotOauthCallback");
		expect(source).toContain("hasBotOauthSession");
		expect(source).toContain("buildBotOauthAuthorizeUrl");
		expect(source).not.toContain("useBotOauth");
	});
});
