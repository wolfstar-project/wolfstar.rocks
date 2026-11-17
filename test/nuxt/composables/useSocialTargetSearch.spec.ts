import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const GUILD = "780";
const asked: Record<string, unknown>[] = [];
let fails = false;

registerEndpoint(`/api/guilds/${GUILD}/social/targets`, {
	method: "GET",
	handler: (event) => {
		const query = Object.fromEntries(new URL(event.path, "http://test").searchParams);
		asked.push(query);
		if (fails) throw createError({ statusCode: 503, statusMessage: "Unavailable" });
		return { suggestions: [{ name: `Match for ${query.query}`, value: String(query.query) }] };
	},
});

describe("useSocialTargetSearch", () => {
	beforeEach(() => {
		asked.length = 0;
		fails = false;
	});

	it("suggests the accounts Staryl finds for the source as the admin types", async () => {
		const query = ref("");
		const { suggestions } = useSocialTargetSearch(GUILD, "Bluesky", query);

		query.value = "bsky";

		await vi.waitFor(() =>
			expect(suggestions.value).toStrictEqual([{ name: "Match for bsky", value: "bsky" }]),
		);
		expect(asked).toStrictEqual([{ query: "bsky", source: "Bluesky" }]);
	});

	it("asks nothing before a source is picked", async () => {
		const { suggestions } = useSocialTargetSearch(GUILD, null, "bsky");

		await new Promise((resolve) => setTimeout(resolve, 400));

		expect(asked).toStrictEqual([]);
		expect(suggestions.value).toStrictEqual([]);
	});

	it("asks nothing for one letter", async () => {
		const { suggestions } = useSocialTargetSearch(GUILD, "Bluesky", "b");

		await new Promise((resolve) => setTimeout(resolve, 400));

		expect(asked).toStrictEqual([]);
		expect(suggestions.value).toStrictEqual([]);
	});

	it("searches the new source for what is typed when the source changes", async () => {
		const source = ref<"Bluesky" | "Mastodon">("Bluesky");
		const { suggestions } = useSocialTargetSearch(GUILD, source, "gargron");
		await vi.waitFor(() => expect(asked).toHaveLength(1));

		source.value = "Mastodon";

		await vi.waitFor(() =>
			expect(asked.at(-1)).toStrictEqual({ query: "gargron", source: "Mastodon" }),
		);
		expect(suggestions.value).toHaveLength(1);
	});

	it("drops the old source's suggestions as soon as the source changes", async () => {
		const source = ref<"Bluesky" | "Mastodon">("Bluesky");
		const { suggestions } = useSocialTargetSearch(GUILD, source, "gargron");
		await vi.waitFor(() => expect(suggestions.value).toHaveLength(1));

		source.value = "Mastodon";
		await nextTick();

		// Before the new search answers, nothing of Bluesky is left to pick.
		expect(suggestions.value).toStrictEqual([]);
	});

	it("suggests nothing when the search fails", async () => {
		fails = true;
		const { suggestions } = useSocialTargetSearch(GUILD, "Bluesky", "bsky");

		await vi.waitFor(() => expect(asked).toHaveLength(1));
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(suggestions.value).toStrictEqual([]);
	});
});
