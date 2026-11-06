import { getDefaultAutoModerationRule } from "#shared/utils/automod-rules";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import RuleEditor from "~/components/guild/automod/RuleEditor.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";

const rule = {
	...getDefaultAutoModerationRule("Words"),
	guildId: "123456789012345678",
	id: "1",
	name: "Bad words",
};

async function mountRuleEditor() {
	const opens: boolean[] = [];
	const saves: unknown[] = [];
	const wrapper = await mountSuspended(RuleEditor, {
		props: {
			"open": true,
			"onUpdate:open": (value: boolean) => opens.push(value),
			"onSave": (body: unknown) => saves.push(body),
			rule,
			"guild": createMockOauthFlattenedGuild({ id: rule.guildId }),
		},
		attachTo: document.body,
	});
	return { wrapper, opens, saves };
}

function button(label: string) {
	return [...document.querySelectorAll("button")].find(
		(element) => element.textContent?.trim() === label,
	);
}

// Accessibility audits for the word list live in test/nuxt/a11y.spec.ts.
describe("GuildAutomodRuleEditor", () => {
	it("closes at once when nothing changed", async () => {
		const { wrapper, opens } = await mountRuleEditor();

		button("Cancel")!.click();

		expect(opens).toStrictEqual([false]);
		wrapper.unmount();
	});

	it("asks before it drops changes", async () => {
		const { wrapper, opens } = await mountRuleEditor();
		const name = document.querySelector<HTMLInputElement>('input[maxlength="50"]');
		name!.value = "Other name";
		name!.dispatchEvent(new Event("input"));
		await wrapper.vm.$nextTick();

		button("Cancel")!.click();
		await wrapper.vm.$nextTick();

		expect(opens).toStrictEqual([]);
		expect(document.body.textContent).toContain("You have changes that are not saved.");

		button("Discard changes")!.click();
		expect(opens).toStrictEqual([false]);
		wrapper.unmount();
	});

	it("adds a word without saving the rule", async () => {
		const { wrapper, saves } = await mountRuleEditor();
		await vi.waitFor(() =>
			expect(
				document.querySelector('input[placeholder="for example: idiot"]'),
			).not.toBeNull(),
		);
		const field = document.querySelector<HTMLInputElement>(
			'input[placeholder="for example: idiot"]',
		)!;
		field.value = "idiot";
		field.dispatchEvent(new Event("input"));
		await wrapper.vm.$nextTick();

		button("Add word")!.click();
		field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		await wrapper.vm.$nextTick();

		expect(saves).toStrictEqual([]);
		expect(document.body.textContent).toContain("Words (1/200)");
		wrapper.unmount();
	});

	it("asks before it drops a word that was typed but not added", async () => {
		const { wrapper, opens } = await mountRuleEditor();
		await vi.waitFor(() =>
			expect(
				document.querySelector('input[placeholder="for example: idiot"]'),
			).not.toBeNull(),
		);
		const field = document.querySelector<HTMLInputElement>(
			'input[placeholder="for example: idiot"]',
		)!;
		field.value = "idiot";
		field.dispatchEvent(new Event("input"));
		await wrapper.vm.$nextTick();

		button("Cancel")!.click();
		await wrapper.vm.$nextTick();

		expect(opens).toStrictEqual([]);
		expect(document.body.textContent).toContain("You have changes that are not saved.");
		wrapper.unmount();
	});
});
