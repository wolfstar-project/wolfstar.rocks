import { getDefaultAutoModerationRule } from "#shared/utils/automod-rules";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
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
	const wrapper = await mountSuspended(RuleEditor, {
		props: {
			"open": true,
			"onUpdate:open": (value: boolean) => opens.push(value),
			rule,
			"guild": createMockOauthFlattenedGuild({ id: rule.guildId }),
		},
		attachTo: document.body,
	});
	return { wrapper, opens };
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
});
