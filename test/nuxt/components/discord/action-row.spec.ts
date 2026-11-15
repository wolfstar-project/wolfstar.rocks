import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordActionRow from "~/components/discord/action-row.vue";
import DiscordButton from "~/components/discord/button.vue";

describe("DiscordActionRow", () => {
	it("groups the slotted buttons (positive)", async () => {
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
		const row = wrapper.find("[role='group']");
		expect(row.findAll(".discord-button")).toHaveLength(2);
		expect(row.text()).toContain("Confirm");
		expect(row.text()).toContain("Cancel");
	});

	it("renders an empty row when no children are slotted (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordActionRow);

		// ASSERT
		expect(wrapper.find("[role='group']").text().trim()).toBe("");
	});
});
