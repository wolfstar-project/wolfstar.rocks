import { describe, expect, it } from "vitest";

const GUILD = "1563165337535389828";

describe("the bot's appeal link", () => {
	it.each([`/app/appeal/${GUILD}`, `/appeal/${GUILD}`])("opens the Home from %s", (path) => {
		const resolved = useRouter().resolve(path);
		const home = useRouter().resolve("/app");

		expect(resolved.matched.at(-1)?.components).toBe(home.matched.at(-1)?.components);
		expect(resolved.params).toStrictEqual({ guild: GUILD });
	});

	it("opens the Home on the appeals without a server", () => {
		const resolved = useRouter().resolve("/app/appeal");

		expect(resolved.name).not.toBeUndefined();
		expect(resolved.matched.at(-1)?.components).toBe(
			useRouter().resolve("/app").matched.at(-1)?.components,
		);
	});
});
