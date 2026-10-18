import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { mockAuth } from "../utils/auth";

mockAuth({ name: "Wolf" });
enablePersistedCacheInTests("cache-user");

const STORED_KEY = "wolfstar-cache:cache-user:probe";

let answers = 0;
const Probe = defineComponent({
	setup() {
		const { data } = usePersistedAsyncData(
			() => "probe",
			// Slow enough for the kept answer to be seen before the new one lands.
			async () => {
				await new Promise((resolve) => setTimeout(resolve, 80));
				return { answer: ++answers };
			},
		);
		return () => h("p", data.value ? String(data.value.answer) : "none");
	},
});

// The account's list is read by several components at once; each one finds the
// kept answer, and together they must fetch behind it once, not once each.
const Readers = defineComponent({
	setup() {
		return () => h("div", [h(Probe), h(Probe), h(Probe)]);
	},
});

describe("usePersistedAsyncData", () => {
	beforeEach(() => {
		answers = 0;
		clearPersistedCache();
		clearNuxtData();
	});

	it("keeps an answer in the browser under the account", async () => {
		const wrapper = await mountSuspended(Probe);

		await vi.waitFor(() => expect(wrapper.text()).toBe("1"));
		expect(JSON.parse(localStorage.getItem(STORED_KEY) ?? "{}")).toMatchObject({
			data: { answer: 1 },
		});
		wrapper.unmount();
	});

	it("shows the kept answer at once and fetches again behind it", async () => {
		const first = await mountSuspended(Probe);
		await vi.waitFor(() => expect(first.text()).toBe("1"));
		first.unmount();
		clearNuxtData();

		const second = await mountSuspended(Probe);

		expect(second.text()).toBe("1");
		await vi.waitFor(() => expect(second.text()).toBe("2"));
		expect(JSON.parse(localStorage.getItem(STORED_KEY) ?? "{}")).toMatchObject({
			data: { answer: 2 },
		});
		second.unmount();
	});

	it("fetches behind a kept answer once, however many components read the key", async () => {
		const first = await mountSuspended(Probe);
		await vi.waitFor(() => expect(first.text()).toBe("1"));
		first.unmount();
		clearNuxtData();

		const readers = await mountSuspended(Readers);

		await vi.waitFor(() => expect(readers.text()).toBe("222"));
		await new Promise((resolve) => setTimeout(resolve, 250));
		expect(answers).toBe(2);
		readers.unmount();
	});
});
