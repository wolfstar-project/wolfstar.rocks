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
				imageURL: null,
				duration: null,
				metadata: { archived: false, completed: false, temporary: false },
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
});
