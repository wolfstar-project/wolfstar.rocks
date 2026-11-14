import type { VueWrapper } from "@vue/test-utils";
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

/** Each section: its heading text and the member names of the list it labels. */
function readSections(wrapper: VueWrapper) {
	return wrapper.findAll("[role='list']").map((list) => {
		const heading = wrapper.find(`[id='${list.attributes("aria-labelledby")}']`);
		return {
			heading: heading.text(),
			items: list.findAll("[role='listitem']"),
		};
	});
}

describe("DiscordMemberList", () => {
	it("renders labeled sections, members, and the verified APP tag (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMemberList, {
			props: { online, offline, label: "Server members" },
		});

		// ASSERT
		expect(wrapper.find("aside").attributes("aria-label")).toBe("Server members");
		const sections = readSections(wrapper);
		expect(sections.map((section) => section.heading)).toEqual(["Online — 2", "Offline — 1"]);
		expect(sections.map((section) => section.items.length)).toEqual([2, 1]);
		const appTag = wrapper.find("[role='img'][aria-label='Verified application']");
		expect(appTag.text()).toBe("APP");
		expect(wrapper.text()).toContain("Shipping tests");
	});

	it("shows the member presence on online rows (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMemberList, {
			props: { online, offline: [] },
		});

		// ASSERT
		const statuses = wrapper
			.findAll("[role='listitem'] [data-status]")
			.map((dot) => dot.attributes("data-status"));
		expect(statuses).toEqual(["online", "dnd"]);
	});

	it("hides presence for offline sections and HTTP apps (negative)", async () => {
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
		expect(wrapper.find("[data-status]").exists()).toBe(false);
		expect(wrapper.find("[role='img'][aria-label='Application']").exists()).toBe(true);
	});

	it("groups pinned role members under their role heading (positive)", async () => {
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
		const [section] = readSections(wrapper);
		expect(section?.heading).toBe("Developers — 1");
		expect(section?.items[0]?.attributes("style")).toContain("linear-gradient");
		expect(wrapper.find("[data-slot='member-name']").attributes("style")).toContain(
			"oklch(70% 0.15 250)",
		);
	});

	it("does not show role as secondary text when showRoles is false (negative)", async () => {
		// ARRANGE / ACT
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
		expect(readSections(wrapper).map((section) => section.heading)).toEqual(["Online — 1"]);
		expect(wrapper.text()).toContain("Shipping tests");
		expect(wrapper.text()).not.toContain("Developers");
	});

	it("shows the role beside the status line when showRoles is true (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMemberList, {
			props: {
				showRoles: true,
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
		expect(wrapper.text()).toContain("Developers · Shipping tests");
	});
});
