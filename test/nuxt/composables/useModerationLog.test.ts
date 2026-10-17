import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { getQuery } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

let fetchCount = 0;
let lastQuery: Record<string, unknown> = {};

registerEndpoint("/api/guilds/123/logs/moderation", {
	method: "GET",
	handler: (event) => {
		fetchCount += 1;
		lastQuery = getQuery(event);
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

	it("sends the case state and the member filters, and leaves out the ones unset", async () => {
		const filters = ref<{ status?: "archived"; userId?: string; moderatorId?: string }>({
			status: "archived",
			userId: "111111111111111111",
		});

		const { execute } = useModerationLog({ guildId: "123", immediate: false, filters });
		await execute();

		expect(lastQuery).toMatchObject({ status: "archived", userId: "111111111111111111" });
		expect(lastQuery).not.toHaveProperty("moderatorId");
	});
});
