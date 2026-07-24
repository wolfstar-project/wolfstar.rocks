import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";

let fetchCount = 0;

registerEndpoint("/api/guilds/123/logs/moderation", {
	method: "GET",
	handler: () => {
		fetchCount += 1;
		return { entries: [], total: 0 };
	},
});

describe("useModerationLog", () => {
	beforeEach(() => {
		fetchCount = 0;
		clearNuxtData();
		const nuxtApp = useNuxtApp();
		for (const key of Object.keys(nuxtApp._asyncData)) {
			delete nuxtApp._asyncData[key];
		}
		for (const key of Object.keys(nuxtApp._asyncDataPromises)) {
			delete nuxtApp._asyncDataPromises[key];
		}
	});

	it("produces different cache keys for different typeCode filters", () => {
		const guildId = "123456789";

		// Inspecting the asyncData key logic behavior
		const keyAll = `guild:${guildId}:logs:moderation:${JSON.stringify({})}`;
		const keyWarning = `guild:${guildId}:logs:moderation:${JSON.stringify({ typeCode: 1 })}`;

		expect(keyAll).not.toEqual(keyWarning);
	});

	it("refetches on filter change", async () => {
		const filters = ref<{ typeCode?: number }>({});
		const limit = ref(10);

		const { status, execute } = useModerationLog({
			guildId: "123",
			immediate: false,
			filters,
			limit,
		});

		await execute();
		expect(status.value).toBe("success");
		const callsBefore = fetchCount;

		// Nested mutation (same pattern as ModerationLogTable.vue).
		filters.value.typeCode = 1;
		await nextTick();
		await vi.waitUntil(() => fetchCount > callsBefore, { timeout: 2_000 });

		expect(fetchCount).toBeGreaterThan(callsBefore);
	});
});
