import { SelectMember } from "#components";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { getQuery } from "h3";
import { describe, expect, it, vi } from "vitest";
import { createMockOauthFlattenedGuild, createMockRole } from "~~/test/mocks/discord";

const GUILD_ID = "123456789012345678";
const KNOWN = "200000000000000001";
const GONE = "200000000000000099";
const MODERATOR = "300000000000000001";
const DELETED_ROLE = "300000000000000099";

// The ids each lookup asked for, newest last.
const idLookups: string[][] = [];

const guild = createMockOauthFlattenedGuild({
	id: GUILD_ID,
	roles: [
		createMockRole({ id: GUILD_ID, name: "@everyone", rawPosition: 0 }),
		createMockRole({
			color: Number.parseInt("3ba55c", 16),
			id: MODERATOR,
			name: "Moderator",
			rawPosition: 2,
		}),
	],
});

function member(id: string, username: string, globalName: string) {
	return {
		guildId: GUILD_ID,
		id,
		joinedTimestamp: null,
		premiumSinceTimestamp: null,
		roles: [],
		user: { avatar: null, bot: false, discriminator: "0", globalName, id, username },
	};
}

registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, {
	method: "GET",
	handler: (event) => {
		const query = getQuery(event);
		if (typeof query["query"] === "string") {
			return "helpful".startsWith(query["query"].toLowerCase())
				? [member(KNOWN, "helper", "Helpful Person")]
				: [];
		}
		const ids = String(query["ids"] ?? "").split(",");
		idLookups.push(ids);
		return ids.includes(KNOWN) ? [member(KNOWN, "helper", "Helpful Person")] : [];
	},
});

function option(name: string): HTMLElement | undefined {
	return [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((element) =>
		element.textContent?.includes(name),
	);
}

// Accessibility audits for SelectMember live in test/nuxt/a11y.spec.ts.
describe("SelectMember", () => {
	it("shows a picked member by name and @username", async () => {
		const wrapper = await mountSuspended(SelectMember, {
			props: { guildId: GUILD_ID, label: "Reviewer", memberIds: [KNOWN] },
		});
		await vi.waitFor(() => expect(wrapper.text()).toContain("Helpful Person"));
		expect(wrapper.text()).toContain("@helper");
	});

	it("keeps a member who left the server, by id", async () => {
		const wrapper = await mountSuspended(SelectMember, {
			props: { guildId: GUILD_ID, label: "Reviewer", memberIds: [GONE] },
		});
		await vi.waitFor(() => expect(wrapper.text()).toContain("Not in the server"));
		expect(wrapper.text()).toContain(GONE);
	});

	it("asks for a member who left once, not again on every pick", async () => {
		idLookups.length = 0;
		const wrapper = await mountSuspended(SelectMember, {
			props: { guildId: GUILD_ID, label: "Reviewers", memberIds: [GONE], multiple: true },
		});
		await vi.waitFor(() => expect(idLookups).toEqual([[GONE]]));
		await flushPromises();
		await wrapper.setProps({ memberIds: [GONE, KNOWN] });
		await vi.waitFor(() => expect(wrapper.text()).toContain("Helpful Person"));

		expect(idLookups.filter((ids) => ids.includes(GONE))).toHaveLength(1);
	});

	it("lists a picked role that was deleted, so it can be unticked", async () => {
		const wrapper = await mountSuspended(SelectMember, {
			attachTo: document.body,
			props: {
				guild,
				guildId: GUILD_ID,
				label: "Allowed",
				multiple: true,
				roleIds: [MODERATOR, DELETED_ROLE],
				roles: true,
			},
		});
		await wrapper.get("button").trigger("click");
		await vi.waitFor(() => expect(option("Unknown role")).toBeDefined());
		option("Unknown role")!.click();
		await vi.waitFor(() =>
			expect(wrapper.emitted("update:roleIds")?.at(-1)).toEqual([[MODERATOR]]),
		);
		wrapper.unmount();
	});

	it("shows roles and members as chips side by side", async () => {
		const wrapper = await mountSuspended(SelectMember, {
			props: {
				guild,
				guildId: GUILD_ID,
				label: "Allowed",
				memberIds: [KNOWN],
				multiple: true,
				roleIds: [MODERATOR],
				roles: true,
			},
		});
		await vi.waitFor(() => expect(wrapper.text()).toContain("Helpful Person"));
		expect(wrapper.text()).toContain("@Moderator");
	});

	it("hands a picked role back as a role id", async () => {
		const wrapper = await mountSuspended(SelectMember, {
			attachTo: document.body,
			props: { guild, guildId: GUILD_ID, label: "Ping", roles: true },
		});
		await wrapper.get("button").trigger("click");
		await vi.waitFor(() => expect(option("@Moderator")).toBeDefined());
		option("@Moderator")!.click();
		await vi.waitFor(() =>
			expect(wrapper.emitted("update:roleIds")?.at(-1)).toEqual([[MODERATOR]]),
		);
		expect(wrapper.emitted("update:memberIds")?.at(-1)).toEqual([[]]);
		wrapper.unmount();
	});

	it("finds members by name and hands one back by id", async () => {
		const wrapper = await mountSuspended(SelectMember, {
			attachTo: document.body,
			props: { guildId: GUILD_ID, label: "Reviewer" },
		});
		await wrapper.get("button").trigger("click");
		const search = await vi.waitFor(() => {
			const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
			expect(input).not.toBeNull();
			return input!;
		});
		search.value = "help";
		search.dispatchEvent(new Event("input", { bubbles: true }));
		await vi.waitFor(() => expect(option("Helpful Person")).toBeDefined(), { timeout: 3000 });
		option("Helpful Person")!.click();
		await vi.waitFor(() =>
			expect(wrapper.emitted("update:memberIds")?.at(-1)).toEqual([[KNOWN]]),
		);
		wrapper.unmount();
	});

	it("leaves @everyone out when asked", async () => {
		const wrapper = await mountSuspended(SelectMember, {
			attachTo: document.body,
			props: { everyone: false, guild, guildId: GUILD_ID, label: "Ignored", roles: true },
		});
		await wrapper.get("button").trigger("click");
		await vi.waitFor(() => expect(option("@Moderator")).toBeDefined());
		expect(option("@everyone")).toBeUndefined();
		wrapper.unmount();
	});
});
