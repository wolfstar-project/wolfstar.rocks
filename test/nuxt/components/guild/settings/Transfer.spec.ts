import type {
	ConfigurationImportResponse,
	ConfigurationNotice,
} from "#shared/utils/settings-transfer";
import type { H3Event } from "h3";
import { getNoticesDigest } from "#shared/utils/settings-transfer";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Transfer from "~/components/guild/settings/Transfer.vue";

const GUILD_ID = "123456789012345678";

const mockChanges = ref<Record<string, unknown> | undefined>(undefined);
const mockToastAdd = vi.fn();
const mockSetGuildSettings = vi.fn();

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: ref(undefined),
	originalGuildSettings: ref(undefined),
	setGuildSettings: mockSetGuildSettings,
}));
mockNuxtImport("useGuildSettingsChanges", () => () => ({ guildSettingsChanges: mockChanges }));
mockNuxtImport("useToast", () => () => ({ add: mockToastAdd }));

let answer: ConfigurationImportResponse = {
	ok: true,
	applied: false,
	preview: { settings: [], rules: null, unsupported: [], notices: [], isEmpty: true },
};
let requests = 0;
let lastBody: Record<string, unknown> | undefined;

// h3's `readBody` needs Node's `Buffer`, which the browser runner lacks; the
// handler reads the web request as it is.
registerEndpoint(`/api/guilds/${GUILD_ID}/settings/import`, {
	method: "POST",
	handler: async (event: H3Event) => {
		requests += 1;
		lastBody = (await event.web?.request?.json()) as Record<string, unknown>;
		return answer;
	},
});

async function chooseFile(wrapper: Awaited<ReturnType<typeof mountSuspended>>, text: string) {
	const root: Element = wrapper.element;
	const input = root.querySelector<HTMLInputElement>('input[type="file"]');
	if (!input) throw new Error("The file input is missing");
	const transfer = new DataTransfer();
	transfer.items.add(new File([text], "wolfstar-settings.json", { type: "application/json" }));
	input.files = transfer.files;
	input.dispatchEvent(new Event("change"));
	await vi.waitFor(() => expect(requests).toBeGreaterThan(0));
	await nextTick();
}

const dialogText = () => document.body.textContent ?? "";

// Unmounted after each test, before the next one clears the page: a dialog
// left open would otherwise be patched into a body it was taken out of.
const mounted: { unmount: () => void }[] = [];

async function mountTransfer() {
	const wrapper = await mountSuspended(Transfer);
	mounted.push(wrapper);
	return wrapper;
}

describe("guild settings transfer", () => {
	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	beforeEach(() => {
		vi.clearAllMocks();
		useActiveGuild().selectGuild(GUILD_ID);
		requests = 0;
		lastBody = undefined;
		mockChanges.value = undefined;
		document.body.innerHTML = "";
	});

	it("offers to export and to import", async () => {
		const wrapper = await mountTransfer();

		const labels = wrapper.findAll("button").map((button) => button.text());

		expect(labels).toContain("Export");
		expect(labels).toContain("Import");
	});

	it("does not import over changes that are not saved yet", async () => {
		mockChanges.value = { language: "it-IT" };
		const wrapper = await mountTransfer();

		const button = wrapper.findAll("button").find((entry) => entry.text() === "Import");

		expect(button?.attributes("disabled")).toBeDefined();
		expect(wrapper.text()).toContain("Save or discard your changes before importing.");
	});

	it("shows what a file changes before anything is written", async () => {
		answer = {
			ok: true,
			applied: false,
			preview: {
				settings: [{ name: "modules.automod", before: true, after: false }],
				rules: {
					mode: "replace",
					created: ["Fresh"],
					updated: [],
					moved: [],
					removed: ["Old"],
					unchanged: 0,
				},
				unsupported: ["join-guard.enabled"],
				notices: [],
				isEmpty: false,
			},
		};
		const wrapper = await mountTransfer();

		await chooseFile(wrapper, "{}");
		await vi.waitFor(() => expect(dialogText()).toContain("modules.automod"));

		// The label and the names stay apart, as Vue drops a space that opens an element:
		expect(dialogText()).toContain("Created (1): Fresh");
		expect(dialogText()).toContain("Deleted (1): Old");
		expect(dialogText()).toContain(
			"The rules of this server that are not in the file are deleted.",
		);
		expect(dialogText()).toContain("join-guard.enabled");
		expect(dialogText()).not.toContain("Not imported");
		expect(mockSetGuildSettings).not.toHaveBeenCalled();
	});

	it("lists what a file of the bot before V7 does not import, with how to set it by hand, even when nothing changes", async () => {
		answer = {
			ok: true,
			applied: false,
			preview: {
				settings: [],
				rules: null,
				unsupported: [],
				notices: [
					{
						kind: "settingFailed",
						path: "settings.disabled-commands",
						name: "disabled-commands",
						target: "commands.disabled",
						reason: "Expected a list.",
					},
					{
						kind: "settingFailed",
						path: "settings.messages.moderation-dm",
						name: "messages.moderation-dm",
						target: "moderation.direct-message",
						reason: "Expected a boolean.",
					},
					{ kind: "noEquivalent", path: "settings.prefix", name: "prefix" },
					{
						kind: "ruleFailed",
						path: "settings.selfmod.invites",
						rule: "Invites",
						reason: 'Two rules are named "Invites".',
					},
				],
				isEmpty: true,
			},
		};
		const wrapper = await mountTransfer();

		await chooseFile(wrapper, "{}");
		await vi.waitFor(() => expect(dialogText()).toContain("Not imported (4)"));

		expect(dialogText()).toContain("There is nothing to import.");
		expect(dialogText()).toContain(
			"disabled-commands could not be imported: Expected a list. Set commands.disabled by hand from the dashboard.",
		);
		// The dashboard has no field for these: the bot's command has.
		expect(dialogText()).toContain(
			"messages.moderation-dm could not be imported: Expected a boolean. Set moderation.direct-message by hand with /settings in Discord, since the dashboard has no field for it.",
		);
		expect(dialogText()).toContain("so there is nothing to set by hand.");
		expect(dialogText()).toContain("Create the rule by hand in Auto Moderation");
		const dialog = document.body.querySelector('[role="dialog"]');
		const labels = Array.from(dialog?.querySelectorAll("button") ?? [], (entry) =>
			entry.textContent?.trim(),
		);
		expect(labels).not.toContain("Import");
	});

	it("says the filters of the old bot are added to the rules, not that the other rules are deleted", async () => {
		answer = {
			ok: true,
			applied: false,
			preview: {
				settings: [],
				rules: {
					mode: "add",
					created: ["Links"],
					updated: [],
					moved: [],
					// A rule of the server with the name of a filter, of another type, is made again:
					removed: ["Links"],
					unchanged: 2,
				},
				unsupported: [],
				notices: [],
				isEmpty: false,
			},
		};
		const wrapper = await mountTransfer();

		await chooseFile(wrapper, "{}");
		await vi.waitFor(() => expect(dialogText()).toContain("Created (1): Links"));

		expect(dialogText()).toContain("A rule of this server with the same name is replaced");
		expect(dialogText()).not.toContain("are not in the file are deleted");
	});

	it("sends back what the preview left out, so an import that would leave out more is refused", async () => {
		const notice: ConfigurationNotice = {
			kind: "ruleFailed",
			path: "settings.selfmod.links",
			rule: "Links",
			reason: 'Two rules are named "Links".',
		};
		answer = {
			ok: true,
			applied: false,
			preview: {
				settings: [{ name: "language", before: "en-US", after: "it-IT" }],
				rules: null,
				unsupported: [],
				notices: [notice],
				isEmpty: false,
			},
		};
		const wrapper = await mountTransfer();

		await chooseFile(wrapper, "{}");
		await vi.waitFor(() => expect(dialogText()).toContain("Not imported (1)"));
		const confirm = [
			...document.body.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'),
		].find((button) => button.textContent?.trim() === "Import");
		confirm!.click();

		await vi.waitFor(() => expect(lastBody?.apply).toBe(true));
		expect(lastBody?.noticesDigest).toBe(getNoticesDigest([notice]));
	});

	it("lists the problems of a file it refuses, and offers nothing to confirm", async () => {
		answer = {
			ok: false,
			issues: [{ path: "settings.language", message: "Expected a language tag." }],
		};
		const wrapper = await mountTransfer();

		await chooseFile(wrapper, "{}");
		await vi.waitFor(() => expect(dialogText()).toContain("This file cannot be imported"));

		expect(dialogText()).toContain("settings.language");
		expect(dialogText()).toContain("Expected a language tag.");
		const dialog = document.body.querySelector('[role="dialog"]');
		const labels = Array.from(dialog?.querySelectorAll("button") ?? [], (entry) =>
			entry.textContent?.trim(),
		);
		expect(labels).toContain("Cancel");
		expect(labels).not.toContain("Import");
	});
});
