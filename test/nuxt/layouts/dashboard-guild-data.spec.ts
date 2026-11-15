import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, ref } from "vue";
import DashboardLayout from "~/layouts/dashboard.vue";
import { createMockChannel, createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { mockAuth } from "../utils/auth";

const GUILD_ID = "254360814063058944";

mockAuth({ name: "Wolf" });
// The server list, in state so the test can refresh it as `useUser()` does.
mockNuxtImport("useUser", () => () => ({
	guilds: useState<OauthFlattenedGuild[]>("test:server-list", () => []),
	status: ref("success"),
	user: ref(null),
}));

// The server list sends each server without its channels.
const listed = () => createMockOauthFlattenedGuild({ id: GUILD_ID, channels: [] });

registerEndpoint(`/api/guilds/${GUILD_ID}`, {
	method: "GET",
	handler: () => createMockOauthFlattenedGuild({ id: GUILD_ID, channels: [createMockChannel()] }),
});
registerEndpoint(`/api/guilds/${GUILD_ID}/settings`, {
	method: "GET",
	handler: () => "{}",
});

describe("the open server's data", () => {
	afterEach(() => {
		clearNuxtState();
	});

	it("keeps the channels when the server list refreshes after the server loaded", async () => {
		const serverList = useState<OauthFlattenedGuild[]>("test:server-list", () => []);
		serverList.value = [listed()];
		useActiveGuild().selectGuild(GUILD_ID);
		const wrapper = await mountSuspended(DashboardLayout, {
			route: "/",
			slots: { default: () => h("main") },
		});
		const { guildData } = useGuildData();
		await vi.waitFor(() => {
			expect(guildData.value?.channels.length).toBeGreaterThan(0);
		});

		serverList.value = [listed()];
		await nextTick();

		expect(guildData.value?.channels.length).toBeGreaterThan(0);
		wrapper.unmount();
	});
});
