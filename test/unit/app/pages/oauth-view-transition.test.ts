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
});
