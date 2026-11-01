import type { AutoDelete, AutoMessage, AutoPurge } from "#shared/utils/auto-channels";
import type { ComponentInternalInstance } from "vue";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { ChannelType } from "discord-api-types/v10";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Editor from "~/components/guild/auto/Editor.vue";
import AutoDeleteSection from "~/components/guild/settings/AutoDelete.vue";
import AutoMessageSection from "~/components/guild/settings/AutoMessage.vue";
import AutoPurgeSection from "~/components/guild/settings/AutoPurge.vue";
import SelectChannel from "~/components/select/Channel.vue";
import { createMockChannel, createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";
const GENERAL = "234567890123456789";
const MEMES = "345678901234567890";

const mockRows = {
	autodelete: ref<AutoDelete[]>([]),
	automessage: ref<AutoMessage[]>([]),
	autopurge: ref<AutoPurge[]>([]),
};
const mockStatus = ref<"idle" | "pending" | "success" | "error">("success");
const mockSetRow = vi.fn();
const mockClearRow = vi.fn();
const mockToastAdd = vi.fn();

mockNuxtImport("useAutoChannels", () => (slug: keyof typeof mockRows) => ({
	clearRow: mockClearRow,
	error: ref(null),
	refresh: vi.fn(),
	rows: mockRows[slug],
	setRow: mockSetRow,
	status: mockStatus,
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(
		createMockOauthFlattenedGuild({
			channels: [
				createMockChannel({ id: GENERAL, name: "general", type: ChannelType.GuildText }),
				createMockChannel({ id: MEMES, name: "memes", type: ChannelType.GuildText }),
			],
			id: GUILD_ID,
		}),
	),
}));

mockNuxtImport("useToast", () => () => ({ add: mockToastAdd }));

const mounted: { unmount(): void }[] = [];
async function mountAttached<T>(component: T) {
	const wrapper = await mountSuspended(component as never, { attachTo: document.body });
	mounted.push(wrapper);
	await flushPromises();
	return wrapper;
}

function dialog() {
	return document.body.querySelector<HTMLElement>('[role="dialog"]');
}

function buttonIn(root: ParentNode | null, text: string) {
	return [...(root?.querySelectorAll("button") ?? [])].find(
		(button) => button.textContent?.trim() === text,
	);
}

interface EditorState {
	draft: { channelId: string | null; filter: string; value: string; content: string };
}

// The editor is mounted in a portal: its draft is reached through its own
// component, as a picker of the dashboard would fill it.
function editorDraft(wrapper: Awaited<ReturnType<typeof mountAttached>>) {
	const editor = wrapper.findComponent(Editor);
	return (editor.vm.$ as ComponentInternalInstance & { setupState: EditorState }).setupState
		.draft;
}

describe("automatic channel sections", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clearNuxtState();
		useActiveGuild().selectGuild(GUILD_ID);
		mockRows.autodelete.value = [];
		mockRows.autopurge.value = [];
		mockRows.automessage.value = [];
		mockStatus.value = "success";
		mockSetRow.mockImplementation(async (channelId: string, body: object) => ({
			ok: true,
			value: { ...body, channelId, id: "1", nextRunAt: "2026-10-23T12:00:00.000Z" },
		}));
		mockClearRow.mockResolvedValue({ ok: true, value: undefined });
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	describe("Auto-Delete", () => {
		it("says there is no channel yet, and that a change waits for a restart", async () => {
			const wrapper = await mountAttached(AutoDeleteSection);

			expect(wrapper.text()).toContain("No channel yet");
			expect(wrapper.text()).toContain("0 / 25");
			expect(wrapper.text()).toContain("Changes apply after a restart of WolfStar");
		});

		it("lists each channel with its delay, its bots and what it keeps", async () => {
			mockRows.autodelete.value = [
				{ allow: ["links", "images"], bots: true, channelId: GENERAL, delay: 60, id: "1" },
			];
			const wrapper = await mountAttached(AutoDeleteSection);

			const row = wrapper.find("tbody tr");
			expect(row.text()).toContain("#general");
			expect(row.text()).toContain("1m");
			expect(row.text()).toContain("Deleted");
			expect(row.text()).toContain("Links");
			expect(row.text()).toContain("Images");
		});

		it("stops the module with its switch, whose channels stay", async () => {
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildSettings().setGuildSettings(createMockGuildData(GUILD_ID));
			mockRows.autodelete.value = [
				{ allow: [], bots: false, channelId: GENERAL, delay: 60, id: "1" },
			];
			const wrapper = await mountAttached(AutoDeleteSection);
			const toggle = wrapper.get('[aria-label="Toggle Auto-Delete"]');
			expect(toggle.attributes("aria-checked")).toBe("true");

			await toggle.trigger("click");

			await vi.waitFor(() =>
				expect(useGuildSettingsChanges().guildSettingsChanges.value).toMatchObject({
					modulesAutodelete: false,
				}),
			);
			expect(wrapper.text()).toContain("general");
		});

		it("offers no new channel once the server has 25", async () => {
			mockRows.autodelete.value = Array.from({ length: 25 }, (_, index) => ({
				allow: [],
				bots: false,
				channelId: String(100_000_000_000_000_000n + BigInt(index)),
				delay: 0,
				id: String(index),
			}));
			const wrapper = await mountAttached(AutoDeleteSection);

			expect(buttonIn(wrapper.element, "Add channel")).toBeUndefined();
		});
	});

	describe("Auto-Purge", () => {
		it("asks for a channel, then for the value its filter needs, before it saves", async () => {
			const wrapper = await mountAttached(AutoPurgeSection);
			buttonIn(wrapper.element, "Add channel")?.click();
			await flushPromises();

			expect(dialog()?.textContent).toContain("Pick a channel.");
			expect(buttonIn(dialog(), "Enable")?.disabled).toBe(true);

			wrapper
				.findComponent(Editor)
				.findComponent(SelectChannel)
				.vm.$emit("update:modelValue", GENERAL);
			editorDraft(wrapper).filter = "user";
			await flushPromises();
			expect(dialog()?.textContent).toContain("This filter needs a user.");

			editorDraft(wrapper).value = "<@111111111111111111>";
			await flushPromises();
			buttonIn(dialog(), "Enable")?.click();
			await flushPromises();

			expect(mockSetRow).toHaveBeenCalledExactlyOnceWith(GENERAL, {
				filter: "user",
				interval: 86_400,
				value: "<@111111111111111111>",
			});
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({ color: "success", title: "Saved" }),
			);
		});

		it("does not offer a channel that already has a purge", async () => {
			mockRows.autopurge.value = [
				{
					channelId: MEMES,
					filter: "any",
					id: "1",
					interval: 604_800,
					nextRunAt: "2026-10-26T04:00:00.000Z",
					value: null,
				},
			];
			const wrapper = await mountAttached(AutoPurgeSection);
			buttonIn(wrapper.element, "Add channel")?.click();
			await flushPromises();

			expect(
				wrapper.findComponent(Editor).findComponent(SelectChannel).props("exclude"),
			).toStrictEqual([MEMES]);
		});

		it("stops purging a channel once the admin confirms", async () => {
			mockRows.autopurge.value = [
				{
					channelId: MEMES,
					filter: "contains",
					id: "1",
					interval: 604_800,
					nextRunAt: "2026-10-26T04:00:00.000Z",
					value: "discord.gg/",
				},
			];
			const wrapper = await mountAttached(AutoPurgeSection);

			expect(wrapper.find("tbody tr").text()).toContain("discord.gg/");
			await wrapper.find('[aria-label="Stop purging #memes"]').trigger("click");
			await flushPromises();
			buttonIn(dialog(), "Stop purging")?.click();
			await flushPromises();

			expect(mockClearRow).toHaveBeenCalledExactlyOnceWith(MEMES);
		});
	});

	describe("Auto-Message", () => {
		const message: AutoMessage = {
			channelId: GENERAL,
			content: "Read #rules before posting.",
			id: "1",
			interval: 86_400,
			mentions: false,
			nextRunAt: "2026-10-23T09:00:00.000Z",
		};

		it("shows each message with how often it is sent", async () => {
			mockRows.automessage.value = [message];
			const wrapper = await mountAttached(AutoMessageSection);

			const card = wrapper.find("li");
			expect(card.text()).toContain("#general");
			expect(card.text()).toContain("Read #rules before posting.");
			expect(card.text()).toContain("every 1 day");
			expect(card.text()).toContain("Mentions do not ping");
		});

		it("writes the mentions switch at once, with the rest of the message as it is", async () => {
			mockRows.automessage.value = [message];
			const wrapper = await mountAttached(AutoMessageSection);

			await wrapper
				.find('[aria-label="Let the mentions of the message in #general ping"]')
				.trigger("click");
			await flushPromises();

			expect(mockSetRow).toHaveBeenCalledExactlyOnceWith(GENERAL, {
				content: message.content,
				interval: 86_400,
				mentions: true,
			});
		});

		it("refuses an empty message", async () => {
			const wrapper = await mountAttached(AutoMessageSection);
			buttonIn(wrapper.element, "Add message")?.click();
			await flushPromises();

			wrapper
				.findComponent(Editor)
				.findComponent(SelectChannel)
				.vm.$emit("update:modelValue", GENERAL);
			await flushPromises();

			expect(dialog()?.textContent).toContain("The message cannot be empty.");
			expect(buttonIn(dialog(), "Enable")?.disabled).toBe(true);
		});
	});
});
