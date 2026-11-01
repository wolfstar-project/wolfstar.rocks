import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { GuildMemberFlags } from "discord-api-types/v10";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { computed, nextTick, ref, toValue, type MaybeRefOrGetter } from "vue";
import ModerationLogTable from "~/components/guild/logs/ModerationLogTable.vue";

const mockEntries = ref<ModerationLogEntry[]>([]);
const mockTotal = ref(0);
const mockStatus = ref<"idle" | "pending" | "success" | "error">("success");
// The filters the table asks for, read back to check what a control sends.
let lastFilters: MaybeRefOrGetter<Record<string, unknown> | undefined> = undefined;

mockNuxtImport(
	"useModerationLog",
	() =>
		({ filters }: { filters?: MaybeRefOrGetter<Record<string, unknown> | undefined> }) => {
			lastFilters = filters;
			return {
				entries: computed(() => mockEntries.value),
				total: computed(() => mockTotal.value),
				status: mockStatus,
				refresh: vi.fn().mockResolvedValue(undefined),
			};
		},
);

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
				status: "open",
				extra: { kind: "roles", roleIds: ["300000000000000003"] },
				message: { channelId: "400000000000000004", messageId: "500000000000000005" },
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
			"Status",
			"Reason",
			"Duration",
			"Date",
		]);
	});

	it("names where each case stands", async () => {
		const component = await mountSuspended(ModerationLogTable);
		const cells = component.findAll("table tbody td").map((cell) => cell.text());

		expect(cells).toContain("Open");
	});

	it("puts the status filter beside the action filter, on both tabs", async () => {
		const moderation = await mountSuspended(ModerationLogTable);
		expect(moderation.find('[aria-label="Filter by action type"]').exists()).toBe(true);
		expect(moderation.find('[aria-label="Filter by case status"]').exists()).toBe(true);
		expect(toValue(lastFilters)?.["status"]).toBeUndefined();

		const warnings = await mountSuspended(ModerationLogTable, {
			props: { warningsOnly: true },
		});
		expect(warnings.find('[aria-label="Filter by action type"]').exists()).toBe(false);
		expect(warnings.find('[aria-label="Filter by case status"]').exists()).toBe(true);
	});

	it("filters by the member a case is about, from the case, and drops the filter again", async () => {
		const component = await mountSuspended(ModerationLogTable, { attachTo: document.body });
		await component.get("table tbody tr button").trigger("click");
		await vi.waitFor(() => {
			expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		});

		const showCases = [
			...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'),
		].find((button) => button.textContent?.includes("Show this member's cases"));
		showCases?.click();
		await vi.waitFor(() => {
			expect(document.querySelector('[role="dialog"]')).toBeNull();
		});

		expect(toValue(lastFilters)?.["userId"]).toBe("100000000000000001");
		const chip = component.get('[aria-label="Remove filter Member: TargetUser"]');
		await vi.waitFor(() => {
			expect(document.activeElement).toBe(chip.element);
		});

		await chip.trigger("click");
		expect(toValue(lastFilters)?.["userId"]).toBeUndefined();
		expect(component.find('[aria-label="Remove filter Member: TargetUser"]').exists()).toBe(
			false,
		);

		component.unmount();
	});

	it("opens a case from its number and gives focus back on close", async () => {
		const component = await mountSuspended(ModerationLogTable, { attachTo: document.body });
		const rowButton = component.get<HTMLButtonElement>("table tbody tr button");
		expect(rowButton.attributes("aria-label")).toBe("Open case 100");
		expect(rowButton.attributes("aria-haspopup")).toBe("dialog");

		// The test viewport is narrow, where the cards show and the table is hidden.
		const opener = component.get<HTMLButtonElement>("ul > li button");
		expect(opener.attributes("aria-label")).toBe("Open case 100");
		opener.element.focus();
		await opener.trigger("click");
		await vi.waitFor(() => {
			expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		});

		const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
		expect(dialog?.textContent).toContain("Case 100");
		expect(dialog?.textContent).toContain("Spam");
		expect(dialog?.textContent).toContain("Roles the member had");
		const link = dialog?.querySelector<HTMLAnchorElement>(
			'a[href="https://discord.com/channels/123456789012345678/400000000000000004/500000000000000005"]',
		);
		expect(link?.getAttribute("target")).toBe("_blank");
		expect(link?.getAttribute("aria-label")).toBe(
			"Open the message of case 100 in Discord, opens in new tab",
		);

		dialog?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
		await vi.waitFor(() => {
			expect(document.querySelector('[role="dialog"]')).toBeNull();
		});
		await nextTick();
		expect(document.activeElement).toBe(opener.element);

		component.unmount();
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
		// Two arrows around the position, as the design pages: no numbered buttons.
		expect(component.get(".logs-page-label:not(.hidden)").text()).toBe("1 / 3");
		const numbered = component
			.findAll("nav button")
			.filter((button) => /^\d+$/.test(button.text()));
		expect(numbered).toHaveLength(0);

		mockTotal.value = 1;
	});
});
