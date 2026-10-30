import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DiscordPermissions from "~/components/guild/commands/DiscordPermissions.vue";
import { createMockOauthFlattenedGuild, createMockRole } from "~~/test/mocks/discord";

const GUILD_ID = "123456789012345678";
const APP_ID = "500000000000000001";
const BAN = "600000000000000001";
const PING = "600000000000000002";
const ROLE = "300000000000000001";

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(
		createMockOauthFlattenedGuild({
			id: GUILD_ID,
			roles: [createMockRole({ id: ROLE, name: "Moderators" })],
		}),
	),
}));

const authorization = { scopeGranted: true, manageGuild: true, manageRoles: true };
let banRows = [{ id: ROLE, type: 1, permission: true }];
let putStatus = 200;

function response() {
	return {
		applicationId: APP_ID,
		commands: [
			{
				id: BAN,
				name: "ban",
				command: "ban",
				category: "Moderation",
				description: "Ban a member",
			},
			{ id: PING, name: "ping", command: "ping", category: "General", description: "Ping" },
		],
		permissions: { [BAN]: banRows },
		snapshot: "x",
		authorization: { ...authorization },
	};
}

let gets = 0;
registerEndpoint(`/api/guilds/${GUILD_ID}/command-permissions`, {
	method: "GET",
	handler: () => {
		gets++;
		return response();
	},
});
registerEndpoint(`/api/guilds/${GUILD_ID}/command-permissions/${BAN}`, {
	method: "PUT",
	handler: () => {
		if (putStatus === 409) throw createError({ status: 409, data: { code: "conflict" } });
		return { permissions: [], snapshot: "[]" };
	},
});
registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, { method: "GET", handler: () => [] });

// The preview is teleported to the body: a wrapper left mounted keeps its
// dialog there, and a later test would press that dialog's buttons.
const mounted: { unmount: () => void }[] = [];

// The block only reads Discord once it is open, as the sign-in coming back leaves it.
async function mount() {
	const wrapper = await mountSuspended(DiscordPermissions, { route: "/?tab=discord" });
	mounted.push(wrapper);
	await vi.waitFor(() => expect(wrapper.text()).toContain("App default"));
	return wrapper;
}

// Accessibility audits for GuildCommandsDiscordPermissions live in test/nuxt/a11y.spec.ts.
describe("GuildCommandsDiscordPermissions", () => {
	beforeEach(() => {
		clearNuxtData();
		clearNuxtState();
		Object.assign(authorization, { scopeGranted: true, manageGuild: true, manageRoles: true });
		banRows = [{ id: ROLE, type: 1, permission: true }];
		putStatus = 200;
		gets = 0;
		useActiveGuild().selectGuild(GUILD_ID);
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("stays closed until asked for, and reads Discord only then", async () => {
		const wrapper = await mountSuspended(DiscordPermissions);
		mounted.push(wrapper);
		expect(wrapper.get("details").attributes("open")).toBeUndefined();
		expect(wrapper.get("summary h2").text()).toBe("Discord permissions");
		expect(gets).toBe(0);

		(wrapper.get("details").element as HTMLDetailsElement).open = true;

		await vi.waitFor(() => expect(wrapper.text()).toContain("App default"));
		expect(gets).toBe(1);
	});

	it("opens when the sign-in that grants the scope comes back", async () => {
		const scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
		const wrapper = await mountSuspended(DiscordPermissions, {
			route: "/?tab=discord",
		});
		mounted.push(wrapper);

		expect(wrapper.get("details").attributes("open")).toBeDefined();
		expect(scrollIntoView).toHaveBeenCalledOnce();
		scrollIntoView.mockRestore();
	});

	it("opens on edits not sent yet", async () => {
		useCommandPermissionDrafts(GUILD_ID).drafts.value = { [BAN]: { base: [], rows: [] } };
		const wrapper = await mountSuspended(DiscordPermissions);
		mounted.push(wrapper);
		expect(wrapper.get("details").attributes("open")).toBeDefined();
		await vi.waitFor(() => expect(wrapper.text()).toContain("App default"));
	});

	it("asks to authorize with Discord when the scope is missing", async () => {
		authorization.scopeGranted = false;
		const wrapper = await mountSuspended(DiscordPermissions, { route: "/?tab=discord" });
		mounted.push(wrapper);
		await vi.waitFor(() => expect(wrapper.text()).toContain("Authorize with Discord"));
		expect(
			wrapper
				.find(
					`a[href="/oauth/login?grant=command-permissions&next=${encodeURIComponent(`/guilds/${GUILD_ID}/manage/commands?tab=discord`)}"]`,
				)
				.exists(),
		).toBe(true);
		expect(wrapper.text()).not.toContain("Review changes");
	});

	it("names Manage Roles and blocks the review without it", async () => {
		authorization.manageRoles = false;
		const wrapper = await mount();
		expect(wrapper.text()).toContain("Manage Roles");
		expect(wrapper.get("button[data-review]").attributes("disabled")).toBeDefined();
	});

	it("lists the app default first, then each command with its status", async () => {
		const wrapper = await mount();
		const titles = wrapper.findAll("[data-card-title]").map((title) => title.text());
		expect(titles[0]).toContain("App default");
		expect(wrapper.get(`[data-status="${BAN}"]`).text()).toBe("Custom");
		expect(wrapper.get(`[data-status="${PING}"]`).text()).toBe("Uses app default");
	});

	it("drops a command's own rows with Use app default", async () => {
		const wrapper = await mount();
		await wrapper.get(`button[data-reset="${BAN}"]`).trigger("click");
		await vi.waitFor(() =>
			expect(wrapper.get(`[data-status="${BAN}"]`).text()).toBe("Uses app default"),
		);
	});

	it("previews what changes, with the Administrator note", async () => {
		const wrapper = await mount();
		await wrapper.get(`button[data-reset="${BAN}"]`).trigger("click");
		await wrapper.get("button[data-review]").trigger("click");
		await vi.waitFor(() => expect(document.body.textContent).toContain("Removed"));
		expect(document.body.textContent).toContain("Moderators");
		expect(document.body.textContent).toContain("Administrator");
	});

	it("stops on a conflict and offers to reload", async () => {
		putStatus = 409;
		const wrapper = await mount();
		await wrapper.get(`button[data-reset="${BAN}"]`).trigger("click");
		await wrapper.get("button[data-review]").trigger("click");
		await vi.waitFor(() => expect(document.querySelector("button[data-send]")).not.toBeNull());
		(document.querySelector("button[data-send]") as HTMLButtonElement).click();
		await vi.waitFor(() => expect(wrapper.text()).toContain("Reload command permissions"));
		expect(wrapper.text()).toContain("changed in Discord");
		// Sending again would write the stale draft over the change made in Discord.
		expect(wrapper.get("button[data-review]").attributes("disabled")).toBeDefined();
	});

	it("blocks the review past 100 rows", async () => {
		banRows = Array.from({ length: 101 }, (_, index) => ({
			id: String(300000000000000100n + BigInt(index)),
			type: 1,
			permission: true,
		}));
		const wrapper = await mount();
		expect(wrapper.text()).toContain("101/100");
		expect(wrapper.get("button[data-review]").attributes("disabled")).toBeDefined();
	});

	it("keeps a staged edit when the section is left and opened again", async () => {
		const first = await mount();
		await first.get(`button[data-reset="${BAN}"]`).trigger("click");
		first.unmount();
		mounted.splice(0);

		const again = await mount();
		expect(again.get(`[data-status="${BAN}"]`).text()).toBe("Uses app default");
	});
});
