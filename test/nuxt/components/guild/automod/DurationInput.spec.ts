import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DurationInput from "~/components/guild/automod/DurationInput.vue";

describe("GuildAutomodDurationInput", () => {
	// The amount and the unit read as one field: square where they meet,
	// rounded at both ends like the fields next to them.
	it("rounds the outer corners of its two fields, and squares the inner ones", async () => {
		const wrapper = await mountSuspended(DurationInput, {
			attachTo: document.body,
			props: { label: "For", modelValue: 1_800_000 },
		});

		const amount = getComputedStyle(wrapper.get("input").element);
		const unit = getComputedStyle(wrapper.get("button[role='combobox']").element);

		expect(amount.borderTopLeftRadius).toBe("6px");
		expect(amount.borderTopRightRadius).toBe("0px");
		expect(unit.borderTopLeftRadius).toBe("0px");
		expect(unit.borderTopRightRadius).toBe("6px");
		expect(unit.borderBottomRightRadius).toBe("6px");

		wrapper.unmount();
	});
});
