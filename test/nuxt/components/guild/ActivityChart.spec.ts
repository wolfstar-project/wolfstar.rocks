import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import ActivityChart from "~/components/guild/ActivityChart.vue";

function days(counts: number[]) {
	const labels = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
	return counts.map((count, index) => ({
		key: `2026-11-0${index + 1}`,
		label: labels[index] ?? "",
		count,
	}));
}

async function mount(counts: number[]) {
	return mountSuspended(ActivityChart, {
		props: {
			days: days(counts),
			label: "Moderation actions per day",
			formatCount: (value: number) => String(value),
		},
	});
}

const ratios = (wrapper: Awaited<ReturnType<typeof mount>>) =>
	wrapper.findAll(".activity-bar").map((bar) => bar.attributes("style"));

describe("GuildActivityChart", () => {
	it("draws a bar a day, scaled to the busiest one, which stands out", async () => {
		const wrapper = await mount([0, 0, 0, 1, 0, 5, 0]);

		expect(wrapper.findAll(".activity-bar")).toHaveLength(7);
		expect(ratios(wrapper)[5]).toContain("--activity-ratio: 1");
		expect(ratios(wrapper)[3]).toContain("--activity-ratio: 0.2");
		expect(wrapper.findAll(".activity-bar--top")).toHaveLength(1);
	});

	it("writes each count over its bar, and each day under the axis", async () => {
		const wrapper = await mount([0, 0, 0, 1, 0, 5, 0]);

		expect(wrapper.findAll(".activity-value").map((value) => value.text())).toStrictEqual([
			"0",
			"0",
			"0",
			"1",
			"0",
			"5",
			"0",
		]);
		expect(wrapper.find(".activity-days").text()).toBe("FriSatSunMonTueWedThu");
	});

	it("draws no bar and stresses no day for a quiet week", async () => {
		const wrapper = await mount([0, 0, 0, 0, 0, 0, 0]);

		expect(ratios(wrapper).every((style) => style?.includes("--activity-ratio: 0"))).toBe(true);
		expect(wrapper.findAll(".activity-bar--top")).toHaveLength(0);
	});

	it("is one image, named with the label it is given, whose day names are not read again", async () => {
		const wrapper = await mount([1, 2, 3, 4, 5, 6, 7]);

		expect(wrapper.findAll('[role="img"]')).toHaveLength(1);
		expect(wrapper.get('[role="img"]').attributes("aria-label")).toBe(
			"Moderation actions per day",
		);
		expect(wrapper.get(".activity-days").attributes("aria-hidden")).toBe("true");
	});
});
