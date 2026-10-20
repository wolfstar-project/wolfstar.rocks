import type { ConfigurationImportResponse } from "#shared/utils/settings-transfer";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
	preview: { settings: [], rules: null, unsupported: [], isEmpty: true },
};
let requests = 0;

// The handler cannot read the request body (see test/nuxt/api/guilds/settings.spec.ts), so it only counts the calls:
registerEndpoint(`/api/guilds/${GUILD_ID}/settings/import`, {
	method: "POST",
	handler: () => {
		requests += 1;
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

describe("guild settings transfer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useActiveGuild().selectGuild(GUILD_ID);
		requests = 0;
		mockChanges.value = undefined;
		document.body.innerHTML = "";
	});

	it("offers to export and to import", async () => {
		const wrapper = await mountSuspended(Transfer);

		const labels = wrapper.findAll("button").map((button) => button.text());

		expect(labels).toContain("Export");
		expect(labels).toContain("Import");
	});

	it("does not import over changes that are not saved yet", async () => {
		mockChanges.value = { language: "it-IT" };
		const wrapper = await mountSuspended(Transfer);

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
					created: ["Fresh"],
					updated: [],
					moved: [],
					removed: ["Old"],
					unchanged: 0,
				},
				unsupported: ["timezone"],
				isEmpty: false,
			},
		};
		const wrapper = await mountSuspended(Transfer);

		await chooseFile(wrapper, "{}");
		await vi.waitFor(() => expect(dialogText()).toContain("modules.automod"));

		// The label and the names stay apart, as Vue drops a space that opens an element:
		expect(dialogText()).toContain("Created (1): Fresh");
		expect(dialogText()).toContain("Deleted (1): Old");
		expect(dialogText()).toContain("timezone");
		expect(mockSetGuildSettings).not.toHaveBeenCalled();
	});

	it("lists the problems of a file it refuses, and offers nothing to confirm", async () => {
		answer = {
			ok: false,
			issues: [{ path: "settings.language", message: "Expected a language tag." }],
		};
		const wrapper = await mountSuspended(Transfer);

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
