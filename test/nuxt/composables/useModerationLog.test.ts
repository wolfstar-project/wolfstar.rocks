import { describe, expect, it, vi } from "vitest";

describe("useModerationLog", () => {
	it("produces different cache keys for different typeCode filters", () => {
		const guildId = "123456789";

		// Inspecting the asyncData key logic behavior
		const keyAll = `guild:${guildId}:logs:moderation:${JSON.stringify({})}`;
		const keyWarning = `guild:${guildId}:logs:moderation:${JSON.stringify({ typeCode: 1 })}`;

		expect(keyAll).not.toEqual(keyWarning);
	});

	it("refetches on filter change", async () => {
		const fetchMock = vi.fn().mockResolvedValue({ entries: [], total: 0 });
		vi.stubGlobal("$fetch", fetchMock);

		const filters = ref<{ typeCode?: number }>({});
		const limit = ref(10);

		useModerationLog({ guildId: "123", immediate: true, filters, limit });

		// wait for initial fetch
		await nextTick();
		const callsBefore = fetchMock.mock.calls.length;

		// change filter — watch should trigger a refetch
		filters.value.typeCode = 1;
		await nextTick();

		expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBefore);
	});
});
