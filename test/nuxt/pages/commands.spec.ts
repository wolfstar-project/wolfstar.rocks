import type { FlattenedCommand } from "#shared/types/discord";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CommandsPage from "~/pages/commands.vue";

function createCommand(overrides: Partial<FlattenedCommand> & { name: string }): FlattenedCommand {
	return {
		category: "General",
		description: `${overrides.name} description`,
		extendedHelp: {},
		guarded: false,
		permissionLevel: 0,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
		...overrides,
	};
}

const mockCommands = ref<FlattenedCommand[]>([]);
const mockStatus = ref<"pending" | "success">("success");
const mockRefresh = vi.fn();

mockNuxtImport("useCommands", () => () => ({
	data: mockCommands,
	status: mockStatus,
	refresh: mockRefresh,
}));

const mountPage = () => mountSuspended(CommandsPage);

const categoryToggle = (wrapper: Awaited<ReturnType<typeof mountPage>>, name: string) => {
	const toggle = wrapper
		.findAll("section[aria-labelledby='categories-heading'] > div > button")
		.find((button) => button.text().startsWith(name));
	if (!toggle) {
		throw new Error(`No toggle for the ${name} category`);
	}
	return toggle;
};

describe("commands page", () => {
	beforeEach(() => {
		mockStatus.value = "success";
		mockRefresh.mockClear();
		mockCommands.value = [
			createCommand({ name: "ping" }),
			createCommand({ category: "Fun", name: "roll" }),
			createCommand({
				category: "Moderation",
				extendedHelp: { usages: ["<user> [reason]"] },
				name: "ban",
				permissionLevel: 6,
			}),
			createCommand({ category: "Moderation", name: "kick", permissionLevel: 5 }),
		];
	});

	it("lists every category with its command count and opens Moderation first", async () => {
		const wrapper = await mountPage();

		expect(categoryToggle(wrapper, "Fun").text()).toContain("1");
		expect(categoryToggle(wrapper, "Moderation").text()).toContain("2");
		expect(categoryToggle(wrapper, "Moderation").attributes("aria-expanded")).toBe("true");
		expect(categoryToggle(wrapper, "Fun").attributes("aria-expanded")).toBe("false");
		expect(wrapper.text()).toContain("ban description");
		expect(wrapper.text()).not.toContain("roll description");
	});

	it("keeps a single category open at a time", async () => {
		const wrapper = await mountPage();

		await categoryToggle(wrapper, "Fun").trigger("click");

		expect(categoryToggle(wrapper, "Fun").attributes("aria-expanded")).toBe("true");
		expect(categoryToggle(wrapper, "Moderation").attributes("aria-expanded")).toBe("false");
	});

	it("expands every match while searching and reports the count", async () => {
		const wrapper = await mountPage();

		await wrapper.find("input[type='search']").setValue("roll");

		expect(wrapper.find("#search-results-count").text()).toBe("1 command found");
		expect(categoryToggle(wrapper, "Fun").attributes("aria-expanded")).toBe("true");
		expect(wrapper.text()).toContain("roll description");
		expect(wrapper.text()).not.toContain("Moderation");
	});

	it("says so when a search matches nothing", async () => {
		const wrapper = await mountPage();

		await wrapper.find("input[type='search']").setValue("zzzzzz");

		expect(wrapper.text()).toContain("No commands found");
	});

	it("offers a retry when the bot returned no commands", async () => {
		mockCommands.value = [];
		const wrapper = await mountPage();

		expect(wrapper.text()).toContain("No commands available");
		const retry = wrapper.findAll("button").find((button) => button.text() === "Try Again");
		await retry?.trigger("click");

		expect(mockRefresh).toHaveBeenCalledOnce();
	});
});
