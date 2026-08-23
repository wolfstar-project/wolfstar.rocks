import type { DiscordMemberListMember } from "~/types/discord";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordMemberList from "~/components/discord/member-list.vue";

const online: DiscordMemberListMember[] = [
	{
		id: "1",
		name: "WolfStar",
		app: true,
		verified: true,
		presence: "online",
		avatar: "/avatars/wolfstar.png",
	},
	{
		id: "2",
		name: "RedStar",
		presence: "dnd",
		description: "Shipping tests",
	},
];

const offline: DiscordMemberListMember[] = [{ id: "3", name: "Stella", presence: "offline" }];

describe("DiscordMemberList", () => {
	it("renders labeled sections, members, and verified APP badge (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMemberList, {
			props: { online, offline, label: "Server members" },
		});

		// ASSERT
		const aside = wrapper.find("aside.discord-member-list");
		expect(aside.attributes("aria-label")).toBe("Server members");
		expect(wrapper.findAll(".discord-member-list-member")).toHaveLength(3);
		expect(wrapper.find(".discord-member-list-section-offline").exists()).toBe(true);
		expect(wrapper.find(".discord-member-list-app").attributes("role")).toBe("img");
		expect(wrapper.find(".discord-member-list-app").attributes("aria-label")).toBe(
			"Verified application",
		);
		expect(wrapper.text()).toContain("Shipping tests");
	});

	it("hides presence badges for offline sections and HTTP apps (negative)", async () => {
		// ARRANGE
		const httpApp: DiscordMemberListMember[] = [
			{ id: "http", name: "Webhook", app: true, http: true },
		];

		// ACT
		const wrapper = await mountSuspended(DiscordMemberList, {
			props: {
				online: httpApp,
				offline: [{ id: "off", name: "Away", presence: "offline" }],
			},
		});

		// ASSERT
		const members = wrapper.findAll(".discord-member-list-member");
		expect(members[0]?.find(".discord-presence").exists()).toBe(false);
		expect(
			wrapper.find(".discord-member-list-section-offline .discord-presence").exists(),
		).toBe(false);
	});

	it("groups pinned role members when showRoles is enabled (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMemberList, {
			props: {
				showRoles: true,
				online: [
					{
						id: "dev",
						name: "Dev",
						role: "Developers",
						pinned: true,
						color: "oklch(70% 0.15 250)",
						rowBackground: "linear-gradient(red, blue)",
					},
				],
				offline: [],
			},
		});

		// ASSERT
		expect(wrapper.find(".discord-member-list-heading-role").exists()).toBe(true);
		expect(wrapper.find(".discord-member-list-member").attributes("style")).toContain(
			"linear-gradient",
		);
		expect(wrapper.find(".discord-member-list-member-decorated").exists()).toBe(true);
	});

	it("does not show role as secondary text when showRoles is false (negative)", async () => {
		// ARRANGE / ACT — pinned headings are independent of showRoles; this asserts
		// the subtitle path only (role name stays out of Online rows when disabled).
		const wrapper = await mountSuspended(DiscordMemberList, {
			props: {
				showRoles: false,
				online: [
					{
						id: "dev",
						name: "Dev",
						role: "Developers",
						description: "Shipping tests",
					},
				],
				offline: [],
			},
		});

		// ASSERT
		expect(wrapper.find(".discord-member-list-heading-role").exists()).toBe(false);
		expect(wrapper.text()).toContain("Online");
		expect(wrapper.text()).toContain("Shipping tests");
		expect(wrapper.text()).not.toContain("Developers");
	});
});
