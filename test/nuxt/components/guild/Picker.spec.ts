import { GuildPicker, UApp } from "#components";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";

const state = vi.hoisted(() => ({
	refresh: undefined as unknown as ReturnType<typeof vi.fn>,
	user: undefined as unknown as Record<string, unknown>,
}));

mockNuxtImport("useUser", () => () => state.user);

function setUser(overrides: Record<string, unknown>) {
	state.refresh = vi.fn(async () => {});
	state.user = {
		error: ref(null),
		guilds: ref([]),
		refresh: state.refresh,
		status: ref("success"),
		...overrides,
	};
}

describe("GuildPicker", () => {
	beforeEach(() => {
		setUser({});
	});

	it("lists the servers the admin can manage", async () => {
		setUser({
			guilds: ref([
				createMockOauthFlattenedGuild({ id: "111111111111111111", name: "Alpha" }),
				createMockOauthFlattenedGuild({
					id: "222222222222222222",
					manageable: false,
					name: "Beta",
				}),
			]),
		});
		// The cards need the tooltip provider `UApp` gives the real page.
		const wrapper = await mountSuspended(
			defineComponent({ setup: () => () => h(UApp, null, () => h(GuildPicker)) }),
		);

		expect(wrapper.findAll('[role="listitem"]')).toHaveLength(1);
		expect(wrapper.text()).toContain("Alpha");
	});

	it("says so when the admin manages no server", async () => {
		const wrapper = await mountSuspended(GuildPicker);

		expect(wrapper.text()).toContain("No servers you can manage yet");
		expect(wrapper.find('[role="alert"]').exists()).toBe(false);
	});

	// A failed `/api/users` leaves the list empty too. Reading that as "no
	// servers" would point the admin at a permission problem they do not have.
	it("reports a failed load and retries it", async () => {
		setUser({ error: ref(new Error("Network error")), status: ref("error") });
		const wrapper = await mountSuspended(GuildPicker);

		const alert = wrapper.get('[role="alert"]');
		expect(alert.text()).toContain("Your servers could not be loaded");
		expect(wrapper.text()).not.toContain("No servers you can manage yet");

		await alert.get("button").trigger("click");

		expect(state.refresh).toHaveBeenCalledOnce();
	});
});
