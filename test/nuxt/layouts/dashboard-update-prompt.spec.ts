import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import DashboardLayout from "~/layouts/dashboard.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";
import { mockAuth } from "../utils/auth";

mockAuth({ name: "Wolf" });
mockNuxtImport("useUser", () => () => ({
	guilds: ref([]),
	status: ref("success"),
	user: ref(null),
}));

const GUILD_ID = "123456789012345678";
// The open server must load, or the layout drops it and the staged changes with it.
registerEndpoint(`/api/guilds/${GUILD_ID}`, () => createMockOauthFlattenedGuild({ id: GUILD_ID }));
registerEndpoint(`/api/guilds/${GUILD_ID}/settings`, () =>
	JSON.stringify(createMockGuildData(GUILD_ID)),
);

const Page = defineComponent({ render: () => h("h1", "page") });

async function mountLayout() {
	return mountSuspended(DashboardLayout, {
		attachTo: document.body,
		route: "/",
		slots: { default: () => h(Page) },
	});
}

// What the manifest poll writes when the server runs a newer build than this tab.
function deployNewerBuild() {
	useState("skew-manifest").value = { id: "a-newer-build", timestamp: Date.now() };
}

function promptShown() {
	const prompt = document.querySelector<HTMLElement>(".dashboard-update-prompt");
	return (
		prompt !== null &&
		getComputedStyle(prompt).display !== "none" &&
		prompt.textContent.includes("Update available")
	);
}

describe("the dashboard's update prompt", () => {
	beforeEach(() => {
		clearNuxtState();
	});

	it("offers a reload once a newer build is deployed", async () => {
		const wrapper = await mountLayout();
		expect(promptShown()).toBe(false);

		deployNewerBuild();

		await vi.waitFor(() => expect(promptShown()).toBe(true), { timeout: 10_000 });
		wrapper.unmount();
	});

	// A reload would drop them: the prompt waits until they are saved or reset.
	it("waits while changes are unsaved", async () => {
		useActiveGuild().selectGuild(GUILD_ID);
		const wrapper = await mountLayout();
		await vi.waitFor(() => expect(useGuildData().guildData.value?.id).toBe(GUILD_ID), {
			timeout: 10_000,
		});
		useGuildSettingsChanges().setGuildSettingsChanges({ language: "en-GB" });
		deployNewerBuild();

		await vi.waitFor(
			() => {
				expect(document.querySelector(".console-savebar")).not.toBeNull();
				expect(document.querySelector(".dashboard-update-prompt")).not.toBeNull();
			},
			{ timeout: 10_000 },
		);
		expect(promptShown()).toBe(false);

		useGuildSettingsChanges().resetGuildSettingsChanges();
		await vi.waitFor(() => expect(promptShown()).toBe(true));
		wrapper.unmount();
	});
});
