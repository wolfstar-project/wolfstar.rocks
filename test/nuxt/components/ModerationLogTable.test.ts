import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { GuildMemberFlags } from "discord-api-types/v10";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import ModerationLogTable from "~/components/guild/logs/ModerationLogTable.vue";

const mockEntries = ref<ModerationLogEntry[]>([]);
const mockTotal = ref(0);
const mockStatus = ref<"idle" | "pending" | "success" | "error">("success");

mockNuxtImport("useModerationLog", () => () => ({
	entries: computed(() => mockEntries.value),
	total: computed(() => mockTotal.value),
	status: mockStatus,
	refresh: vi.fn().mockResolvedValue(undefined),
}));

describe("ModerationLogTable", () => {
	it("renders properly with empty state", async () => {
		mockEntries.value = [];
		mockTotal.value = 0;
		mockStatus.value = "success";

		const component = await mountSuspended(ModerationLogTable, {
			props: { guildId: "123456" },
		});

		expect(component.html()).toContain("No moderation cases found");
	});

	it("renders entries and ensures badge uses semantic colors, not hex literals", async () => {
		const entries: ModerationLogEntry[] = [
			{
				caseId: 100,
				guildId: "123456789012345678",
				userId: "100000000000000001",
				targetMember: {
					user: {
						id: "100000000000000001",
						username: "TargetUser",
						discriminator: "0",
						global_name: "TargetUser",
						avatar: null,
					},
					roles: [],
					deaf: false,
					mute: false,
					joined_at: "",
					flags: 0 as GuildMemberFlags,
				},
				moderatorId: "200000000000000002",
				moderatorMember: {
					user: {
						id: "200000000000000002",
						username: "ModUser",
						discriminator: "0",
						global_name: "ModUser",
						avatar: null,
					},
					roles: [],
					deaf: false,
					mute: false,
					joined_at: "",
					flags: 0 as GuildMemberFlags,
				},
				typeCode: 1,
				typeName: "Ban",
				reason: "Spam",
				referenceId: null,
				duration: 0,
				metadata: { archived: false, completed: false, temporary: false, undo: false },
				createdAt: "2026-05-15T12:00:00.000Z",
			},
		];

		mockEntries.value = entries;
		mockTotal.value = 1;
		mockStatus.value = "success";

		const component = await mountSuspended(ModerationLogTable, {
			props: { guildId: "123456" },
		});

		expect(component.html()).toContain("100");
		expect(component.html()).toContain("TargetUser");
		expect(component.html()).toContain("Ban");

		// Ensure no hardcoded hex colors appear in inline style attributes (semantic tokens must be used)
		expect(component.html()).not.toMatch(/style="[^"]*#[0-9a-fA-F]{3,8}/);
	});

	// The same entries are laid out twice: a table from `md` up, cards below it.
	it("renders each case as a table row and as a card", async () => {
		const component = await mountSuspended(ModerationLogTable);

		expect(component.findAll("table tbody tr")).toHaveLength(1);
		expect(component.findAll("ul > li")).toHaveLength(1);
		expect(component.get("ul > li").text()).toContain("by ModUser");
	});

	it("lays the table out in the design's columns", async () => {
		const component = await mountSuspended(ModerationLogTable);

		expect(component.findAll("table thead th").map((cell) => cell.text())).toStrictEqual([
			"Case",
			"User",
			"Moderator",
			"Action",
			"Reason",
			"Duration",
			"Date",
		]);
	});

	it("reads a ban with no duration as permanent and names the target by handle", async () => {
		const component = await mountSuspended(ModerationLogTable);
		const cells = component.findAll("table tbody td").map((cell) => cell.text());

		expect(cells).toContain("#100");
		expect(cells).toContain("@TargetUser");
		expect(cells).toContain("Permanent");
	});

	it("drops the duration column for warnings", async () => {
		const component = await mountSuspended(ModerationLogTable, {
			props: { warningsOnly: true },
		});

		expect(component.findAll("table thead th").map((cell) => cell.text())).not.toContain(
			"Duration",
		);
	});

	it("pages through the server's total", async () => {
		mockTotal.value = 25;
		const component = await mountSuspended(ModerationLogTable);

		expect(component.text()).toContain("Showing 1 of 25 entries");
		const pages = component
			.findAll("nav button")
			.map((button) => button.text())
			.filter((text) => /^\d+$/.test(text));
		expect(pages).toStrictEqual(["1", "2", "3"]);

		mockTotal.value = 1;
	});
});
