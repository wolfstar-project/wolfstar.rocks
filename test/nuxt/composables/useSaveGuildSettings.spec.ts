import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { beforeEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";
const OTHER_ID = "223456789012345678";

let mode: "ok" | "fail" = "ok";

registerEndpoint(`/api/guilds/${GUILD_ID}/settings`, {
	method: "PATCH",
	handler: () => {
		if (mode === "fail") throw createError({ statusCode: 500 });
		return JSON.stringify(createMockGuildData(GUILD_ID, { language: "it-IT" }));
	},
});

async function setup() {
	let saver!: ReturnType<typeof useSaveGuildSettings>;
	await mountSuspended(
		defineComponent({
			setup() {
				saver = useSaveGuildSettings();
				return () => h("div");
			},
		}),
	);
	return { saver };
}

describe("useSaveGuildSettings", () => {
	beforeEach(() => {
		mode = "ok";
		clearNuxtState();
		useActiveGuild().selectGuild(OTHER_ID);
		useGuildSettings().setGuildSettings(createMockGuildData(GUILD_ID), GUILD_ID);
	});

	it("stores the answer under the server it was for, not the one open by now", async () => {
		const { saver } = await setup();

		await expect(saver.save(GUILD_ID, { language: "it-IT" })).resolves.toBe(true);

		// Reads the store of the server the write was for.
		useActiveGuild().selectGuild(GUILD_ID);
		expect(useGuildSettings().guildSettings.value?.language).toBe("it-IT");
	});

	it("reports a refused save and leaves the settings as they were", async () => {
		mode = "fail";
		const { saver } = await setup();

		await expect(saver.save(GUILD_ID, { language: "it-IT" })).resolves.toBe(false);

		useActiveGuild().selectGuild(GUILD_ID);
		expect(useGuildSettings().guildSettings.value?.language).toBe("en-US");
	});
});
