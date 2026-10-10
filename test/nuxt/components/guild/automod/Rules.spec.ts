import type { AutoModerationRule } from "#shared/utils/automod-rules";
import { getDefaultAutoModerationRule } from "#shared/utils/automod-rules";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Rules from "~/components/guild/automod/Rules.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";

const GUILD_ID = "123456789012345678";

function makeRule(id: string, name: string, enabled = true): AutoModerationRule {
	return { ...getDefaultAutoModerationRule("Words"), enabled, guildId: GUILD_ID, id, name };
}

const mockRules = ref<AutoModerationRule[]>([]);
const mockStatus = ref<"idle" | "pending" | "success" | "error">("success");
const mockUpdateRule = vi.fn();
const mockDeleteRule = vi.fn();
const mockCreateRule = vi.fn();
const mockRefresh = vi.fn();
const mockToastAdd = vi.fn();

mockNuxtImport("useAutomodRules", () => () => ({
	createRule: mockCreateRule,
	deleteRule: mockDeleteRule,
	refresh: mockRefresh,
	rules: mockRules,
	status: mockStatus,
	updateRule: mockUpdateRule,
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(createMockOauthFlattenedGuild({ id: GUILD_ID })),
}));

mockNuxtImport("useToast", () => () => ({ add: mockToastAdd }));

// Accessibility audits for GuildAutomodRules live in test/nuxt/a11y.spec.ts.
describe("GuildAutomodRules", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRules.value = [makeRule("1", "Bad words"), makeRule("2", "Quiet rule", false)];
		mockStatus.value = "success";
		mockUpdateRule.mockResolvedValue({ ok: true, value: makeRule("1", "Bad words", false) });
		mockDeleteRule.mockResolvedValue({ ok: true, value: undefined });
	});

	it("lists every rule with its type and punishment", async () => {
		const wrapper = await mountSuspended(Rules);

		const items = wrapper.findAll("li");
		expect(items).toHaveLength(2);
		expect(items[0]!.text()).toContain("Bad words");
		expect(items[0]!.text()).toContain("Filtered words");
		expect(items[0]!.text()).toContain("Warning");
		expect(wrapper.text()).toContain("2 / 25 rules");
	});

	it("shows placeholders while the rules load", async () => {
		mockStatus.value = "pending";
		mockRules.value = [];
		const wrapper = await mountSuspended(Rules);

		expect(wrapper.find('[role="status"]').exists()).toBe(true);
		expect(wrapper.findAll("li")).toHaveLength(0);
	});

	it("says so when there is no rule yet", async () => {
		mockRules.value = [];
		const wrapper = await mountSuspended(Rules);

		expect(wrapper.text()).toContain("No rules yet");
	});

	it("offers a retry when the rules cannot be loaded", async () => {
		mockStatus.value = "error";
		mockRules.value = [];
		const wrapper = await mountSuspended(Rules);

		expect(wrapper.find('[role="alert"]').exists()).toBe(true);
		const retry = wrapper.findAll("button").find((button) => button.text() === "Try again");
		await retry!.trigger("click");
		expect(mockRefresh).toHaveBeenCalledOnce();
	});

	it("saves a toggle at once, for that rule only", async () => {
		const wrapper = await mountSuspended(Rules);

		await wrapper.find('[aria-label="Toggle rule Bad words"]').trigger("click");
		await nextTick();

		expect(mockUpdateRule).toHaveBeenCalledExactlyOnceWith("1", { enabled: false });
	});

	it("tells the admin when a toggle is refused", async () => {
		mockUpdateRule.mockResolvedValue({ ok: false, code: "unknown" });
		const wrapper = await mountSuspended(Rules);

		await wrapper.find('[aria-label="Toggle rule Bad words"]').trigger("click");
		await nextTick();
		await nextTick();

		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				color: "error",
				description: "This rule no longer exists. Reload the page.",
			}),
		);
	});

	it("stops offering new rules at the limit", async () => {
		mockRules.value = Array.from({ length: 25 }, (_, index) =>
			makeRule(String(index + 1), `Rule ${index + 1}`),
		);
		const wrapper = await mountSuspended(Rules);

		const create = wrapper.findAll("button").find((button) => button.text() === "New rule");
		expect(create!.attributes("disabled")).toBeDefined();
	});
});
