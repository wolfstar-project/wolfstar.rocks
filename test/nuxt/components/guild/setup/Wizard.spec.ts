import { GuildSetupWizard } from "#components";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";
const CHANNEL_ID = "234567890123456789";

const { mockSave } = vi.hoisted(() => ({ mockSave: vi.fn() }));

mockNuxtImport("useSaveGuildSettings", () => () => ({ save: mockSave }));

const mounted: { unmount: () => void }[] = [];

async function mountWizard() {
	const wrapper = await mountSuspended(GuildSetupWizard, { attachTo: document.body });
	mounted.push(wrapper);
	return wrapper;
}

function storedStatuses() {
	return JSON.parse(localStorage.getItem("wolfstar-guild-setup") ?? "{}") as Record<
		string,
		string
	>;
}

function dialog() {
	return document.body.querySelector<HTMLElement>('[role="dialog"]');
}

function buttonLabelled(text: string) {
	return [...document.body.querySelectorAll<HTMLButtonElement>("button")].find(
		(button) =>
			button.textContent?.includes(text) || button.getAttribute("aria-label")?.includes(text),
	);
}

function prepareGuild(setupPending: boolean) {
	useActiveGuild().selectGuild(GUILD_ID);
	useGuildData().setGuildData(
		createMockOauthFlattenedGuild({
			id: GUILD_ID,
			name: "Pixel Parlor",
			setupPending: setupPending ? true : undefined,
		}),
	);
	useGuildSettings().setGuildSettings(createMockGuildData(GUILD_ID));
}

// Accessibility audits for GuildSetupWizard live in test/nuxt/a11y.spec.ts.
describe("GuildSetupWizard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		clearNuxtState();
		mockSave.mockResolvedValue(true);
	});

	afterEach(() => {
		// The dialog is teleported to the body, so it outlives a test unless unmounted.
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("opens by itself on a server with no settings yet, on the modules step", async () => {
		prepareGuild(true);
		await mountWizard();

		await vi.waitFor(() => expect(dialog()).not.toBeNull());
		expect(dialog()?.textContent).toContain("Let's set up Pixel Parlor");
		expect(dialog()?.textContent).toContain("Step 1 of 5");
	});

	it("stays closed for a server that has settings", async () => {
		prepareGuild(false);
		await mountWizard();

		await nextTick();
		expect(dialog()).toBeNull();
	});

	it("stays closed for a server whose setup was skipped, and offers to resume it", async () => {
		localStorage.setItem("wolfstar-guild-setup", JSON.stringify({ [GUILD_ID]: "skipped" }));
		prepareGuild(true);
		await mountWizard();

		await nextTick();
		expect(dialog()).toBeNull();
		expect(useGuildSetup().skipped.value).toBe(true);
	});

	it("moves through the steps and asks for the channels of the modules that are on", async () => {
		prepareGuild(true);
		await mountWizard();
		await vi.waitFor(() => expect(dialog()).not.toBeNull());

		buttonLabelled("Continue to Channels")?.click();
		await vi.waitFor(() =>
			expect(dialog()?.textContent).toContain("Where should WolfStar post?"),
		);

		expect(dialog()?.textContent).toContain("Moderation Log");
		expect(dialog()?.textContent).toContain("Event Log");
		expect(buttonLabelled("Back to Modules")).toBeDefined();
	});

	it("skips for now: closes, keeps the choices and remembers it", async () => {
		prepareGuild(true);
		await mountWizard();
		await vi.waitFor(() => expect(dialog()).not.toBeNull());

		buttonLabelled("Skip setup for now")?.click();

		await vi.waitFor(() => expect(dialog()).toBeNull());
		expect(storedStatuses()).toStrictEqual({ [GUILD_ID]: "skipped" });
		expect(useGuildSetup().draft.value.modules.modulesAutomod).toBe(true);
	});

	it("saves every choice at once on the review step, and is done", async () => {
		prepareGuild(true);
		await mountWizard();
		await vi.waitFor(() => expect(dialog()).not.toBeNull());
		const setup = useGuildSetup();
		setup.draft.value = {
			...setup.draft.value,
			eventsChannel: CHANNEL_ID,
			moderationChannel: CHANNEL_ID,
		};
		setup.goTo(5);
		await vi.waitFor(() => expect(dialog()?.textContent).toContain("Ready when you are"));

		buttonLabelled("Finish setup")?.click();

		await vi.waitFor(() => expect(mockSave).toHaveBeenCalledOnce());
		expect(mockSave).toHaveBeenCalledWith(
			GUILD_ID,
			expect.objectContaining({
				logsMemberAdd: CHANNEL_ID,
				moderationChannel: CHANNEL_ID,
				modulesAutomod: true,
				modulesLogs: true,
				modulesRoles: false,
			}),
		);
		await vi.waitFor(() => expect(dialog()).toBeNull());
		expect(storedStatuses()).toStrictEqual({ [GUILD_ID]: "done" });
		expect(useGuildSetup().pending.value).toBe(false);
	});

	it("stays open with the choices when the save fails", async () => {
		mockSave.mockResolvedValue(false);
		prepareGuild(true);
		await mountWizard();
		await vi.waitFor(() => expect(dialog()).not.toBeNull());
		useGuildSetup().goTo(5);
		await vi.waitFor(() => expect(dialog()?.textContent).toContain("Ready when you are"));

		buttonLabelled("Finish setup")?.click();

		await vi.waitFor(() => expect(mockSave).toHaveBeenCalledOnce());
		await nextTick();
		expect(dialog()).not.toBeNull();
		expect(storedStatuses()).toStrictEqual({});
	});
});
