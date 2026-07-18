/**
 * Contract tests for the `$api` client BFF (`/api/bot/**`).
 *
 * Real handler: `server/api/bot/[...path].ts`
 *
 * These routes forward to the internal WolfStar bot API
 * (`NUXT_PUBLIC_API_BASE_URL`). Contract tests mock the Nitro endpoints to
 * validate URL wiring and response shape without hitting the live bot API.
 */

import type { WolfCommand } from "#shared/types/discord";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

const MOCK_COMMANDS: WolfCommand[] = [
	{
		aliases: ["vk"],
		category: "Moderation",
		description: "Kick a user from voice",
		extendedHelp: {},
		guarded: false,
		name: "voicekick",
		permissionLevel: 5,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
		subCategory: "",
	},
];

const MOCK_LANGUAGES = ["en-US", "it", "es-ES"];

registerEndpoint("/api/bot/commands", {
	method: "GET",
	handler: () => MOCK_COMMANDS,
});

registerEndpoint("/api/bot/languages", {
	method: "GET",
	handler: () => MOCK_LANGUAGES,
});

describe("GET /api/bot/commands", () => {
	it("returns a list of command objects", async () => {
		const data = await $fetch<WolfCommand[]>("/api/bot/commands");
		expect(Array.isArray(data)).toBe(true);
		expect(data).toHaveLength(1);
		expect(data[0]?.name).toBe("voicekick");
		expect(data[0]?.aliases).toStrictEqual(["vk"]);
	});
});

describe("GET /api/bot/languages", () => {
	it("returns a list of language codes", async () => {
		const data = await $fetch<string[]>("/api/bot/languages");
		expect(data).toStrictEqual(MOCK_LANGUAGES);
	});
});
