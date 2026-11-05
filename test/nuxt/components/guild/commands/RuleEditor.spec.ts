import type { H3Event } from "h3";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import RuleEditor from "~/components/guild/commands/RuleEditor.vue";
import GuildMemberPicker from "~/components/guild/MemberPicker.vue";
import SelectChannels from "~/components/select/Channels.vue";
import {
	createMockChannel,
	createMockOauthFlattenedGuild,
	createMockRole,
} from "~~/test/mocks/discord";

const GUILD_ID = "123456789012345678";
const APP_ID = "500000000000000009";
const ARCHIVE_ID = "600000000000000001";
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
	subCategory: null,
};

function rule(lists: Record<string, string[]> = {}, command = "archive") {
	return {
		command,
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
async function readSentBody(event: H3Event): Promise<Record<string, unknown>> {
	return (await event.web?.request?.json()) as Record<string, unknown>;
}

let stored = { command: "archive", enabled: true, onlyAllowed: false, rule: rule(), revision: 1 };
let gets = 0;
let putStatus = 200;
let rulePut: Record<string, unknown> | undefined;

let discordRows: { id: string; type: number; permission: boolean }[] = [];
let registered = true;
const authorization = { scopeGranted: true, manageGuild: true, manageRoles: true };
let discordPut: { commandId: string; body: Record<string, unknown> } | undefined;
let discordPutError: { status: number; code: string } | undefined;

for (const target of ["archive", "*"]) {
	registerEndpoint(`/api/guilds/${GUILD_ID}/command-rules/${target}`, {
		method: "GET",
		handler: () => {
			gets++;
			return stored;
		},
	});
	registerEndpoint(`/api/guilds/${GUILD_ID}/command-rules/${target}`, {
		method: "PUT",
		handler: async (event) => {
			rulePut = await readSentBody(event);
			if (putStatus === 409) throw createError({ status: 409, data: { code: "conflict" } });
			return {
				...stored,
				enabled: rulePut.enabled,
				revision: 2,
				commandsDisabled: rulePut.enabled ? [] : ["archive"],
				commandsRestrictions: [],
			};
		},
	});
}

registerEndpoint(`/api/guilds/${GUILD_ID}/command-permissions`, {
	method: "GET",
	handler: () => ({
		applicationId: APP_ID,
		commands: [
			{
				id: registered ? ARCHIVE_ID : null,
				name: "archive",
				command: "archive",
				category: "Moderation",
				description: "Archive",
			},
		],
		permissions:
			discordRows.length > 0 ? { [ARCHIVE_ID]: discordRows, [APP_ID]: discordRows } : {},
		snapshot: "x",
		authorization: { ...authorization },
	}),
});

for (const commandId of [ARCHIVE_ID, APP_ID]) {
	registerEndpoint(`/api/guilds/${GUILD_ID}/command-permissions/${commandId}`, {
		method: "PUT",
		handler: async (event) => {
			const body = await readSentBody(event);
			discordPut = { commandId, body };
			if (discordPutError) {
				throw createError({
					status: discordPutError.status,
					data: { code: discordPutError.code },
				});
			}
			return { permissions: body.permissions, snapshot: "y" };
		},
	});
}

registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, {
	method: "GET",
	handler: () => [
		{
			guildId: GUILD_ID,
			id: USER,
			joinedTimestamp: null,
			premiumSinceTimestamp: null,
			roles: [],
			user: {
				avatar: null,
				bot: false,
				discriminator: "0",
				globalName: "Stella",
				id: USER,
				username: "stella",
			},
		},
	],
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

/** The switch a label names, or `null` without one. */
function switchFor(text: string): HTMLElement | null {
	const label = [...dialog().querySelectorAll("label")].find((element) =>
		element.textContent?.includes(text),
	);
	const id = label?.getAttribute("for");
	return id ? document.getElementById(id) : null;
}

const discordSwitch = () => switchFor("Also in Discord");

async function mount(props: Record<string, unknown> = {}) {
	const wrapper = await mountSuspended(RuleEditor, {
		props: { open: true, command: archive, ...props },
		attachTo: document.body,
	});
	mounted.push(wrapper);
	await vi.waitFor(() => expect(dialog().querySelector("form")).not.toBeNull());
	return wrapper;
}

/** Mounts once Discord's permissions are read, which the switch waits for. */
async function mountRead(props: Record<string, unknown> = {}) {
	const wrapper = await mount(props);
	await vi.waitFor(() => expect(discordSwitch()?.hasAttribute("disabled")).toBe(false));
	return wrapper;
}

describe("GuildCommandsRuleEditor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clearNuxtState();
		clearNuxtData();
		stored = {
			command: "archive",
			enabled: true,
			onlyAllowed: false,
			rule: rule(),
			revision: 1,
		};
		gets = 0;
		putStatus = 200;
		rulePut = undefined;
		discordRows = [];
		registered = true;
		Object.assign(authorization, { scopeGranted: true, manageGuild: true, manageRoles: true });
		discordPut = undefined;
		discordPutError = undefined;
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

	it("names its form after the command", async () => {
		await mount();

		expect(document.querySelector('form[aria-label="archive settings form"]')).not.toBeNull();
	});

	it("wires each hint to its field", async () => {
		await mount();
		const field = dialog().querySelector<HTMLElement>(
			'[aria-describedby]:not([role="dialog"]):not([role="switch"])',
		);
		const hint = document.getElementById(field?.getAttribute("aria-describedby") ?? "");
		expect(hint?.textContent).toContain(
			"They run it over an ignored role below them; with only the allowed, nobody else does.",
		);

		const enabled = dialog().querySelector<HTMLElement>('[role="switch"]');
		const enabledHint = document.getElementById(
			enabled?.getAttribute("aria-describedby") ?? "",
		);
		expect(enabledHint?.textContent).toContain(
			"Members can run archive where the rules below allow it.",
		);
	});

	it("counts what the tile counts and shows the members by name", async () => {
		stored.rule = rule({
			allowedChannels: [MOD_CHAT],
			ignoredRoles: [STAFF],
			allowedUsers: [USER],
		});
		await mount();
		expect(dialog().textContent).toContain("3 rules");
		expect(dialog().textContent).toContain("mod-chat");
		await vi.waitFor(() => expect(dialog().textContent).toContain("Stella"));
		expect(dialog().textContent).toContain("Allowed Members");
		expect(dialog().textContent).toContain(
			"A member's own rule wins over the rules of their roles.",
		);
	});

	it("says there is no rule, with the fields empty", async () => {
		await mount();
		expect(dialog().textContent).toContain("No rules");
		expect(dialog().textContent).toContain("Select Channel");
		expect(dialog().textContent).toContain("Select Role");
		expect(dialog().textContent).toContain("Add member");
	});

	it("hides the fields while the command is off, and keeps what they hold", async () => {
		stored.rule = rule({ allowedChannels: [MOD_CHAT] });
		await mount();

		dialog().querySelector<HTMLElement>('[role="switch"]')?.click();
		await nextTick();

		expect(dialog().textContent).toContain("Nobody can run archive on this server.");
		expect(dialog().textContent).toContain("Off on this server");
		expect(dialog().textContent).toContain(
			"Its rules are kept and come back when you turn the command on again.",
		);
		expect(dialog().textContent).not.toContain("Allowed Channels");

		button("Save rules").click();
		await vi.waitFor(() => expect(rulePut).toBeDefined());
		expect(rulePut).toMatchObject({ enabled: false, allowedChannels: [MOD_CHAT] });
	});

	it("keeps the command to the allowed roles and members with its status", async () => {
		stored = { ...stored, onlyAllowed: true, rule: rule({ allowedRoles: [STAFF] }) };
		await mount();
		const onlyAllowed = switchFor("Only the allowed roles and members");

		expect(onlyAllowed?.getAttribute("aria-checked")).toBe("true");
		expect(dialog().textContent).toContain("Everyone else cannot run it.");

		onlyAllowed?.click();
		await nextTick();
		button("Save rules").click();

		await vi.waitFor(() => expect(rulePut).toBeDefined());
		expect(rulePut).toMatchObject({ onlyAllowed: false, allowedRoles: [STAFF] });
	});

	it("counts a rule that only keeps the command to nobody listed", async () => {
		stored = { ...stored, onlyAllowed: true };
		await mount();
		expect(dialog().textContent).toContain("1 rule");
		expect(dialog().textContent).not.toContain("No rules");
	});

	it("says what an allowed and an ignored role do", async () => {
		await mount();
		expect(dialog().textContent).toContain(
			"They cannot run it, unless a higher role or their own rule allows them.",
		);
		expect(dialog().textContent).toContain("They cannot run it, whatever their roles.");
		expect(dialog().textContent).toContain("It never runs here.");
	});

	it("shows what the rules of its groups leave in force", async () => {
		stored = { ...stored, rule: rule({ allowedRoles: [STAFF] }) };
		await mount({
			inherited: [
				{ ...rule({ ignoredRoles: [STAFF], ignoredChannels: [MOD_CHAT] }), command: "*" },
			],
		});

		expect(dialog().textContent).toContain("Also applies");
		expect(dialog().textContent).toContain("Every command");
		expect(dialog().textContent).toContain("#mod-chat");
		// Its own rule outranks the ignored role of every command.
		expect(dialog().textContent).not.toContain("Not for roles");
		expect(dialog().textContent).toContain("2 rules");
	});

	it("says when a group turns the command off", async () => {
		await mount({ disabledBy: "Moderation.*" });
		expect(dialog().textContent).toContain(
			"Moderation is turned off with /commands. Turning this command on here does not undo that.",
		);
	});

	it("moves an id picked in the opposite list, and notes where it is", async () => {
		stored.rule = rule({ ignoredChannels: [MOD_CHAT] });
		const wrapper = await mount();
		const [allowed, ignored] = wrapper.findAllComponents(SelectChannels);

		expect(allowed!.props("optionNotes")?.get(MOD_CHAT)).toBe("ignored");
		expect(ignored!.props("optionNotes")?.size).toBe(0);

		allowed!.vm.$emit("update:modelValue", [MOD_CHAT]);
		await nextTick();

		expect(allowed!.props("modelValue")).toStrictEqual([MOD_CHAT]);
		expect(ignored!.props("modelValue")).toStrictEqual([]);
		expect(ignored!.props("optionNotes")?.get(MOD_CHAT)).toBe("allowed");
	});

	it("moves a member picked on the other side, and saves the members", async () => {
		stored.rule = rule({ allowedUsers: [USER] });
		const wrapper = await mount();
		const [allowed, ignored] = wrapper.findAllComponents(GuildMemberPicker);

		ignored!.vm.$emit("update:ids", [USER]);
		await nextTick();
		expect(allowed!.props("ids")).toStrictEqual([]);
		expect(ignored!.props("ids")).toStrictEqual([USER]);

		button("Save rules").click();
		await vi.waitFor(() => expect(rulePut).toBeDefined());
		expect(rulePut).toMatchObject({ allowedUsers: [], ignoredUsers: [USER] });
	});

	it("opens on the stored status when nothing is staged", async () => {
		stored = { ...stored, enabled: false };
		await mount();
		expect(dialog().querySelector('[role="switch"]')?.getAttribute("aria-checked")).toBe(
			"false",
		);
	});

	it("opens on a staged status and saves with the revision", async () => {
		stored.rule = rule({ allowedChannels: [MOD_CHAT] });
		const wrapper = await mount({ stagedEnabled: false });
		expect(dialog().querySelector('[role="switch"]')?.getAttribute("aria-checked")).toBe(
			"false",
		);

		button("Save rules").click();
		await vi.waitFor(() => expect(wrapper.emitted("saved")).toBeTruthy());
		expect(rulePut).toEqual({
			revision: 1,
			enabled: false,
			onlyAllowed: false,
			allowedChannels: [MOD_CHAT],
			ignoredChannels: [],
			allowedRoles: [],
			ignoredRoles: [],
			allowedUsers: [],
			ignoredUsers: [],
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

		switchFor("Only the allowed roles and members")?.click();
		await nextTick();
		button("Save rules").click();
		await vi.waitFor(() =>
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({ color: "warning", title: "archive changed" }),
			),
		);
		await vi.waitFor(() => expect(dialog().textContent).toContain("Off on this server"));
		expect(gets).toBe(2);
		expect(wrapper.emitted("saved")).toBeUndefined();
		const enabled = dialog().querySelector<HTMLElement>('[role="switch"]');
		expect(enabled?.getAttribute("aria-checked")).toBe("false");

		enabled?.click();
		await vi.waitFor(() => expect(dialog().textContent).toContain("1 rule"));
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

	describe("also in Discord", () => {
		it("is on when Discord holds the rules, and counts its permissions", async () => {
			stored.rule = rule({ allowedRoles: [STAFF] });
			discordRows = [{ id: STAFF, type: 1, permission: true }];
			await mountRead();

			expect(discordSwitch()?.getAttribute("aria-checked")).toBe("true");
			expect(dialog().textContent).toContain("1 of 100 Discord permissions");
			expect(dialog().textContent).toContain("1 rule · also in Discord");
			expect(dialog().textContent).toContain("Discord's own permissions of /archive");
		});

		it("writes the rules as Discord's permissions when turned on", async () => {
			stored = { ...stored, onlyAllowed: true, rule: rule({ allowedChannels: [MOD_CHAT] }) };
			await mountRead();
			expect(discordSwitch()?.getAttribute("aria-checked")).toBe("false");

			discordSwitch()?.click();
			await vi.waitFor(() =>
				expect(dialog().textContent).toContain("3 of 100 Discord permissions"),
			);
			button("Save rules").click();

			await vi.waitFor(() => expect(discordPut).toBeDefined());
			// Nothing changed in WolfStar, so only Discord is written.
			expect(rulePut).toBeUndefined();
			expect(discordPut?.commandId).toBe(ARCHIVE_ID);
			expect(discordPut?.body.permissions).toEqual(
				expect.arrayContaining([
					{ id: GUILD_ID, type: 1, permission: false },
					{ id: MOD_CHAT, type: 3, permission: true },
					{ id: String(BigInt(GUILD_ID) - 1n), type: 3, permission: false },
				]),
			);
			expect(discordPut?.body.snapshot).toBe(`[["${ARCHIVE_ID}",[]]]`);
			await vi.waitFor(() =>
				expect(mockToastAdd).toHaveBeenCalledWith(
					expect.objectContaining({
						color: "success",
						description:
							"WolfStar applies the rules of archive, and Discord shows it only where they let it run.",
					}),
				),
			);
		});

		it("clears what Discord holds when turned off", async () => {
			stored.rule = rule({ allowedRoles: [STAFF] });
			discordRows = [{ id: STAFF, type: 1, permission: true }];
			await mountRead();

			discordSwitch()?.click();
			await nextTick();
			button("Save rules").click();

			await vi.waitFor(() => expect(discordPut).toBeDefined());
			expect(discordPut?.body.permissions).toEqual([]);
		});

		it("refuses to save past Discord's 100 permissions", async () => {
			const roles = Array.from({ length: 101 }, (_, index) =>
				String(300000000000000100n + BigInt(index)),
			);
			stored.rule = rule({ allowedRoles: roles });
			await mountRead();

			discordSwitch()?.click();
			await vi.waitFor(() =>
				expect(dialog().textContent).toContain(
					"Discord keeps at most 100 permissions per command. Remove some, or turn this off.",
				),
			);
			button("Save rules").click();

			await vi.waitFor(() =>
				expect(mockToastAdd).toHaveBeenCalledWith(
					expect.objectContaining({
						title: "Rules not saved",
						description:
							"Discord keeps at most 100 permissions per command. Remove some, or turn off Also in Discord.",
					}),
				),
			);
			expect(rulePut).toBeUndefined();
			expect(discordPut).toBeUndefined();
		});

		it("asks to authorize with Discord when the sign-in cannot write it", async () => {
			authorization.scopeGranted = false;
			stored.rule = rule({ allowedRoles: [STAFF] });
			await mountRead();

			discordSwitch()?.click();
			await vi.waitFor(() =>
				expect(dialog().textContent).toContain("Authorize with Discord"),
			);
			const back = `/guilds/${GUILD_ID}/manage/commands?rules=archive`;
			expect(
				dialog().querySelector(`a[href="/oauth/login?next=${encodeURIComponent(back)}"]`),
			).not.toBeNull();

			button("Save rules").click();
			await vi.waitFor(() =>
				expect(mockToastAdd).toHaveBeenCalledWith(
					expect.objectContaining({
						description: "Authorize with Discord first, or turn off Also in Discord.",
					}),
				),
			);
			expect(discordPut).toBeUndefined();
		});

		it("says only WolfStar applies the rules of a command Discord does not have", async () => {
			registered = false;
			await mount();

			await vi.waitFor(() =>
				expect(dialog().textContent).toContain(
					"Not registered with Discord here, so only WolfStar applies these rules.",
				),
			);
			expect(discordSwitch()).toBeNull();
		});

		it("says when Discord's permissions are not the rules", async () => {
			stored.rule = rule({ allowedRoles: [STAFF] });
			discordRows = [{ id: STAFF, type: 1, permission: false }];
			await mountRead();

			expect(dialog().textContent).toContain(
				"Discord's permissions of /archive are not these rules",
			);
			expect(discordSwitch()?.getAttribute("aria-checked")).toBe("true");
		});

		it("notes that Discord does not rank an allowed role under an ignored one", async () => {
			stored.rule = rule({ allowedRoles: [STAFF], ignoredRoles: ["300000000000000002"] });
			await mountRead();
			discordSwitch()?.click();

			await vi.waitFor(() =>
				expect(dialog().textContent).toContain(
					"Discord lets a member run it when any of their roles is allowed",
				),
			);
		});

		it("keeps what WolfStar saved and says why when Discord refuses", async () => {
			discordPutError = { status: 403, code: "role-above" };
			const wrapper = await mountRead();

			switchFor("Only the allowed roles and members")?.click();
			discordSwitch()?.click();
			await nextTick();
			button("Save rules").click();

			await vi.waitFor(() =>
				expect(dialog().textContent).toContain("Saved in WolfStar, not in Discord"),
			);
			expect(dialog().textContent).toContain(
				"One of the roles named is at or above your highest role.",
			);
			expect(rulePut).toMatchObject({ onlyAllowed: true });
			expect(wrapper.emitted("saved")).toHaveLength(1);
			expect(wrapper.emitted("update:open")).toBeUndefined();
		});
	});

	describe("every command", () => {
		beforeEach(() => {
			stored = { ...stored, command: "*", rule: rule({ ignoredRoles: [STAFF] }, "*") };
		});

		it("has no status of its own and nothing else that applies", async () => {
			await mount({ command: "*", inherited: [] });

			expect(dialog().textContent).toContain("Every command");
			expect(dialog().textContent).toContain(
				"What every command uses together with its own rules.",
			);
			expect(switchFor("Enabled")).toBeNull();
			expect(dialog().textContent).not.toContain("Also applies");
			expect(dialog().textContent).toContain("Allowed Roles");
		});

		it("saves with the stored status and writes the app default to Discord", async () => {
			stored.enabled = false;
			await mountRead({ command: "*" });

			discordSwitch()?.click();
			await nextTick();
			expect(dialog().textContent).toContain("Discord uses these for every command");
			switchFor("Only the allowed roles and members")?.click();
			await nextTick();
			button("Save rules").click();

			await vi.waitFor(() => expect(discordPut).toBeDefined());
			expect(rulePut).toMatchObject({ enabled: false, onlyAllowed: true });
			expect(discordPut?.commandId).toBe(APP_ID);
			await vi.waitFor(() =>
				expect(mockToastAdd).toHaveBeenCalledWith(
					expect.objectContaining({
						description:
							"Every command follows the new rules, in WolfStar and in Discord.",
					}),
				),
			);
		});
	});
});
