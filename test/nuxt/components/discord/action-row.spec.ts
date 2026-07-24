import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordActionRow from "~/components/discord/action-row.vue";
import DiscordButton from "~/components/discord/button.vue";

describe("DiscordActionRow", () => {
	it("renders slotted children in a flex action row (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended({
			components: { DiscordActionRow, DiscordButton },
			template: `
				<DiscordActionRow>
					<DiscordButton label="Confirm" variant="primary" />
					<DiscordButton label="Cancel" variant="secondary" />
				</DiscordActionRow>
			`,
		});

		// ASSERT
		expect(wrapper.find(".discord-action-row").exists()).toBe(true);
		expect(wrapper.findAll(".discord-button")).toHaveLength(2);
		expect(wrapper.text()).toContain("Confirm");
		expect(wrapper.text()).toContain("Cancel");
	});

	it("renders an empty row when no children are slotted (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordActionRow);

		// ASSERT
		expect(wrapper.find(".discord-action-row").exists()).toBe(true);
		expect(wrapper.find(".discord-button").exists()).toBe(false);
		expect(wrapper.find(".discord-action-row").text().trim()).toBe("");
	});
});
