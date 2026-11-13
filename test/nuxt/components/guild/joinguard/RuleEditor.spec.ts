import type { JoinGuardRule, JoinGuardRuleInput } from "#shared/utils/join-guard";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ChannelType } from "discord-api-types/v10";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import RuleCard from "~/components/guild/joinguard/RuleCard.vue";
import RuleEditor from "~/components/guild/joinguard/RuleEditor.vue";
import {
	createMockChannel,
	createMockOauthFlattenedGuild,
	createMockRole,
} from "~~/test/mocks/discord";

const GUILD_ID = "123456789012345678";
const QUARANTINE = "300000000000000001";
const MOD_CHAT = "400000000000000001";

const guild = createMockOauthFlattenedGuild({
	channels: [createMockChannel({ id: MOD_CHAT, name: "mod-chat", type: ChannelType.GuildText })],
	id: GUILD_ID,
	roles: [createMockRole({ id: QUARANTINE, name: "Quarantine" })],
});

mockNuxtImport("useGuildData", () => () => ({ guildData: ref(guild) }));

function makeRule(overrides: Partial<JoinGuardRule> = {}): JoinGuardRule {
	return {
		accountAgeMax: 7 * 86_400,
		alertChannelId: MOD_CHAT,
		createdAt: 0,
		defaultAvatar: false,
		directMessage: true,
		enabled: true,
		generatedName: false,
		hardAction: null,
		id: "1",
		name: "Fresh accounts",
		nameContains: null,
		roleId: null,
		sendToCheckpoint: true,
		unverifiedBot: false,
		...overrides,
	};
}

describe("GuildJoinguardRuleCard", () => {
	it("shows the conditions and the actions, toned by the rule", async () => {
		const wrapper = await mountSuspended(RuleCard, { props: { rule: makeRule() } });

		const chips = wrapper.findAll(".jg-chip").map((chip) => chip.text());
		expect(chips).toStrictEqual(["< 7 days", "Checkpoint", "DM", "Alert #mod-chat"]);
		expect(wrapper.findAll(".jg-chip--primary")).toHaveLength(3);
		expect(wrapper.find("h3").text()).toBe("Fresh accounts");
	});

	it("tones a rule that bans as a danger, and dims a rule that is off", async () => {
		const wrapper = await mountSuspended(RuleCard, {
			props: {
				rule: makeRule({
					accountAgeMax: null,
					alertChannelId: null,
					directMessage: false,
					enabled: false,
					hardAction: "Ban",
					nameContains: "nitro",
					sendToCheckpoint: false,
				}),
			},
		});

		expect(wrapper.findAll(".jg-chip").map((chip) => chip.text())).toStrictEqual([
			"Name has “nitro”",
			"Ban",
		]);
		expect(wrapper.findAll(".jg-chip--error")).toHaveLength(1);
		expect(wrapper.find("article").classes()).toContain("jg-rule--off");
	});

	it("asks to edit, delete or switch the rule", async () => {
		const wrapper = await mountSuspended(RuleCard, { props: { rule: makeRule() } });

		await wrapper.get('[aria-label="Edit rule Fresh accounts"]').trigger("click");
		await wrapper.get('[aria-label="Delete rule Fresh accounts"]').trigger("click");
		await wrapper.get('[aria-label="Turn the rule Fresh accounts on or off"]').trigger("click");

		expect(wrapper.emitted("edit")).toHaveLength(1);
		expect(wrapper.emitted("delete")).toHaveLength(1);
		expect(wrapper.emitted("toggle")).toStrictEqual([[false]]);
	});
});

// The dialog is teleported to the body: a wrapper left mounted keeps it there.
const mounted: { unmount: () => void }[] = [];

function dialog(): HTMLElement {
	const element = document.querySelector<HTMLElement>('[role="dialog"]');
	if (!element) throw new Error("expected the editor's dialog");
	return element;
}

/** The checkbox of a card, found by the start of its label. */
function box(label: string): HTMLElement {
	const found = [...dialog().querySelectorAll<HTMLElement>('[role="checkbox"]')].find((element) =>
		element.closest("label")?.textContent?.trim().startsWith(label),
	);
	if (!found) throw new Error(`expected a "${label}" box`);
	return found;
}

async function tick(label: string) {
	box(label).click();
	await nextTick();
	await nextTick();
}

function button(text: string): HTMLButtonElement {
	const found = [...dialog().querySelectorAll<HTMLButtonElement>("button")].find(
		(element) => element.textContent?.trim() === text,
	);
	if (!found) {
		const footer = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
			(element) => element.textContent?.trim() === text,
		);
		if (footer) return footer;
		throw new Error(`expected a "${text}" button`);
	}
	return found;
}

async function typeName(value: string) {
	const field = dialog().querySelector<HTMLInputElement>(
		'input[placeholder="e.g. Fresh accounts"]',
	);
	if (!field) throw new Error("expected the name field");
	field.value = value;
	field.dispatchEvent(new Event("input", { bubbles: true }));
	await nextTick();
}

async function mountEditor(props: { rule?: JoinGuardRule | null; checkpointOn?: boolean } = {}) {
	const wrapper = await mountSuspended(RuleEditor, {
		attachTo: document.body,
		props: { checkpointOn: true, guild, open: true, rule: null, ...props },
	});
	mounted.push(wrapper);
	await vi.waitFor(() => expect(dialog().querySelector("form")).not.toBeNull());
	return wrapper;
}

function lastSaved(wrapper: Awaited<ReturnType<typeof mountEditor>>) {
	return (wrapper.emitted("save") ?? []).at(-1)?.[0] as JoinGuardRuleInput | undefined;
}

// Accessibility audits for the Join Guard components live in test/nuxt/a11y.spec.ts.
describe("GuildJoinguardRuleEditor", () => {
	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("opens a new rule as the design does, and says what it does", async () => {
		await mountEditor();

		expect(dialog().textContent).toContain("New guard rule");
		expect(box("Account younger than").getAttribute("aria-checked")).toBe("true");
		expect(box("Send to the checkpoint").getAttribute("aria-checked")).toBe("true");
		expect(dialog().textContent).toContain(
			"A member who joins with an account younger than 7 days is sent to the checkpoint and is told why in a DM.",
		);
	});

	it("refuses a rule without a name, then saves it once named", async () => {
		const wrapper = await mountEditor();

		button("Create rule").click();
		await vi.waitFor(() =>
			expect(dialog().querySelector('[role="alert"]')?.textContent).toContain(
				"Give the rule a name.",
			),
		);
		expect(wrapper.emitted("save")).toBeUndefined();

		await typeName("Fresh accounts");
		button("Create rule").click();
		await vi.waitFor(() => expect(lastSaved(wrapper)).toBeDefined());
		expect(lastSaved(wrapper)).toMatchObject({
			accountAgeMax: 7 * 86_400,
			directMessage: true,
			hardAction: null,
			name: "Fresh accounts",
			sendToCheckpoint: true,
		});
	});

	it("shows the problems in order: no condition before no action", async () => {
		const wrapper = await mountEditor();
		await typeName("Empty");
		await tick("Account younger than");
		await tick("Send to the checkpoint");
		await tick("Tell them in a DM");

		button("Create rule").click();
		await vi.waitFor(() =>
			expect(dialog().querySelector('[role="alert"]')?.textContent).toContain(
				"Pick at least one thing the account must have.",
			),
		);

		await tick("Default avatar");
		await vi.waitFor(() =>
			expect(dialog().querySelector('[role="alert"]')?.textContent).toContain(
				"Pick at least one thing WolfStar does.",
			),
		);
		expect(wrapper.emitted("save")).toBeUndefined();
	});

	it("lets a kick or a ban turn off the checkpoint and each other", async () => {
		await mountEditor();

		await tick("Kick");
		expect(box("Kick").getAttribute("aria-checked")).toBe("true");
		expect(box("Send to the checkpoint").getAttribute("aria-checked")).toBe("false");
		expect(dialog().textContent).toContain("is kicked and a case is opened");

		await tick("Ban");
		expect(box("Ban").getAttribute("aria-checked")).toBe("true");
		expect(box("Kick").getAttribute("aria-checked")).toBe("false");

		await tick("Send to the checkpoint");
		expect(box("Ban").getAttribute("aria-checked")).toBe("false");
	});

	it("refuses the checkpoint while it is off, and says where to turn it on", async () => {
		const wrapper = await mountEditor({ checkpointOn: false });

		expect(box("Send to the checkpoint").getAttribute("aria-checked")).toBe("false");
		expect(dialog().textContent).toContain(
			"The checkpoint is off: turn it on in the Verification checkpoint card",
		);

		await typeName("Fresh");
		await tick("Send to the checkpoint");
		button("Create rule").click();
		await vi.waitFor(() =>
			expect(dialog().querySelector('[role="alert"]')?.textContent).toContain(
				"Turn the checkpoint on before sending members to it.",
			),
		);
		expect(wrapper.emitted("save")).toBeUndefined();
	});

	it("edits a rule it was given and offers to delete it", async () => {
		const wrapper = await mountEditor({
			rule: makeRule({ hardAction: "Kick", sendToCheckpoint: false }),
		});

		expect(dialog().textContent).toContain("Edit rule · Fresh accounts");
		expect(box("Kick").getAttribute("aria-checked")).toBe("true");

		button("Delete rule").click();
		await nextTick();
		expect(wrapper.emitted("delete")).toHaveLength(1);

		button("Save rule").click();
		await vi.waitFor(() => expect(lastSaved(wrapper)).toMatchObject({ hardAction: "Kick" }));
	});
});
