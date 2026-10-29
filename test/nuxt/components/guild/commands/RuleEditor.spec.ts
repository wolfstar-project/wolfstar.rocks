import type { H3Event } from "h3";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RuleEditor from "~/components/guild/commands/RuleEditor.vue";
import {
	createMockChannel,
	createMockOauthFlattenedGuild,
	createMockRole,
} from "~~/test/mocks/discord";

const GUILD_ID = "123456789012345678";
const MOD_CHAT = "400000000000000001";
const STAFF = "300000000000000001";
const USER = "500000000000000001";

const mockToastAdd = vi.fn();
mockNuxtImport("useToast", () => () => ({ add: mockToastAdd }));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(
		createMockOauthFlattenedGuild({
			id: GUILD_ID,
			channels: [createMockChannel({ id: MOD_CHAT, name: "mod-chat" })],
			roles: [createMockRole({ id: STAFF, name: "Staff" })],
		}),
	),
}));

const archive = {
	name: "archive",
	label: "archive",
	category: "Moderation",
	description: "Save and read the recent messages of members.",
};

function rule(lists: Record<string, string[]> = {}) {
	return {
		command: "archive",
		allowedChannels: [],
		ignoredChannels: [],
		allowedRoles: [],
		ignoredRoles: [],
		allowedUsers: [],
		ignoredUsers: [],
		...lists,
	};
}

// h3's `readBody` needs Node's `Buffer`, which the browser runner lacks; the
// stub hands the handler the web request, whose body reads as it is.
let lastBody: Record<string, unknown> | undefined;
async function readSentBody(event: H3Event): Promise<Record<string, unknown>> {
	lastBody = (await event.web?.request?.json()) as Record<string, unknown>;
	return lastBody;
}
function lastPutBody(): Record<string, unknown> | undefined {
	return lastBody;
}

let stored = { command: "archive", enabled: true, rule: rule(), revision: 1 };
let gets = 0;
let putStatus = 200;

registerEndpoint(`/api/guilds/${GUILD_ID}/command-rules/archive`, {
	method: "GET",
	handler: () => {
		gets++;
		return stored;
	},
});
registerEndpoint(`/api/guilds/${GUILD_ID}/command-rules/archive`, {
	method: "PUT",
	handler: async (event) => {
		await readSentBody(event);
		if (putStatus === 409) throw createError({ status: 409, data: { code: "conflict" } });
		return {
			...stored,
			enabled: lastBody?.enabled,
			revision: 2,
			commandsDisabled: lastBody?.enabled ? [] : ["archive"],
			commandsRestrictions: [],
		};
	},
});

// The dialog is teleported to the body: a wrapper left mounted keeps it there.
const mounted: { unmount: () => void }[] = [];

function dialog(): HTMLElement {
	const element = document.querySelector<HTMLElement>('[role="dialog"]');
	if (!element) throw new Error("expected the editor's dialog");
	return element;
}

function button(text: string): HTMLButtonElement {
	const found = [...dialog().querySelectorAll<HTMLButtonElement>("button")].find((element) =>
		element.textContent?.includes(text),
	);
	if (!found) throw new Error(`expected a "${text}" button`);
	return found;
}

async function mount(props: Record<string, unknown> = {}) {
	const wrapper = await mountSuspended(RuleEditor, {
		props: { open: true, command: archive, enabled: true, ...props },
		attachTo: document.body,
	});
	mounted.push(wrapper);
	await vi.waitFor(() => expect(dialog().querySelector("form")).not.toBeNull());
	return wrapper;
}

describe("GuildCommandsRuleEditor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clearNuxtState();
		stored = { command: "archive", enabled: true, rule: rule(), revision: 1 };
		gets = 0;
		putStatus = 200;
		lastBody = undefined;
		useActiveGuild().selectGuild(GUILD_ID);
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("names the command, its category and description", async () => {
		await mount();
		expect(dialog().textContent).toContain("Command rules (archive)");
		expect(dialog().textContent).toContain(
			"Moderation · Save and read the recent messages of members.",
		);
	});

	it("wires each hint to its field", async () => {
		await mount();
		const field = dialog().querySelector<HTMLElement>(
			'[aria-describedby]:not([role="dialog"]):not([role="switch"])',
		);
		const hint = document.getElementById(field?.getAttribute("aria-describedby") ?? "");
		expect(hint?.textContent).toContain("Only these channels. Empty means every channel.");

		const enabled = dialog().querySelector<HTMLElement>('[role="switch"]');
		const enabledHint = document.getElementById(
			enabled?.getAttribute("aria-describedby") ?? "",
		);
		expect(enabledHint?.textContent).toContain(
			"Members can run archive where the rules below allow it.",
		);
	});

	it("counts the entries of the four lists and notes kept members", async () => {
		stored.rule = rule({
			allowedChannels: [MOD_CHAT],
			ignoredRoles: [STAFF],
			allowedUsers: [USER],
		});
		await mount();
		expect(dialog().textContent).toContain("2 rules");
		expect(dialog().textContent).toContain(
			"1 member set with /commands in Discord stays as it is.",
		);
		expect(dialog().textContent).toContain("mod-chat");
	});

	it("opens on the status it is given and saves with the revision", async () => {
		stored.rule = rule({ allowedChannels: [MOD_CHAT] });
		const wrapper = await mount({ enabled: false });
		expect(dialog().querySelector('[role="switch"]')?.getAttribute("aria-checked")).toBe(
			"false",
		);

		button("Save rules").click();
		await vi.waitFor(() => expect(wrapper.emitted("saved")).toBeTruthy());
		expect(lastPutBody()).toEqual({
			revision: 1,
			enabled: false,
			allowedChannels: [MOD_CHAT],
			ignoredChannels: [],
			allowedRoles: [],
			ignoredRoles: [],
		});
		expect(wrapper.emitted("saved")?.[0]?.[1]).toBe(GUILD_ID);
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({ color: "success", title: "Command rules saved" }),
		);
		expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);
	});

	it("reloads the rule and says so when it changed meanwhile", async () => {
		putStatus = 409;
		const wrapper = await mount();
		stored = { ...stored, enabled: false, rule: rule({ ignoredRoles: [STAFF] }), revision: 7 };

		button("Save rules").click();
		await vi.waitFor(() =>
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({ color: "warning", title: "archive changed" }),
			),
		);
		await vi.waitFor(() => expect(dialog().textContent).toContain("1 rule"));
		expect(gets).toBe(2);
		expect(wrapper.emitted("saved")).toBeUndefined();
		expect(dialog().querySelector('[role="switch"]')?.getAttribute("aria-checked")).toBe(
			"false",
		);
	});

	it("gives focus back to what opened it", async () => {
		const opener = document.createElement("button");
		document.body.append(opener);
		const wrapper = await mount({ opener });

		button("Cancel").click();
		await vi.waitFor(() => expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]));
		await wrapper.setProps({ open: false });
		await vi.waitFor(() => expect(document.activeElement).toBe(opener));
		opener.remove();
	});
});
