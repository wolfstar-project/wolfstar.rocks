import type { ChangelogContributorItem } from "~/utils/parse-release-contributors";
import { UApp } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import ChangelogContributorMention from "~/components/changelog/ContributorMention.vue";
import ChangelogContributors from "~/components/changelog/Contributors.vue";

const baseProps: ChangelogContributorItem = {
	name: "RedStar",
	username: "RedStar071",
	commits: 1847,
	hasContributed: true,
	avatarSrc: "https://github.com/RedStar071.png",
};

/** UTooltip requires TooltipProvider from UApp. */
function mountMention(props: ChangelogContributorItem, open = false) {
	return mountSuspended({
		components: { ChangelogContributorMention, UApp },
		setup() {
			return { props, open: open || undefined };
		},
		template: `
			<UApp>
				<ChangelogContributorMention v-bind="props" :open="open" />
			</UApp>
		`,
	});
}

function mountContributorsList(contributors: ChangelogContributorItem[], idPrefix: string) {
	return mountSuspended({
		components: { ChangelogContributors, UApp },
		setup() {
			return { contributors, idPrefix };
		},
		template: `
			<UApp>
				<ChangelogContributors :contributors="contributors" :id-prefix="idPrefix" />
			</UApp>
		`,
	});
}

describe("ChangelogContributorMention", () => {
	it("renders the display name and username as a GitHub profile link", async () => {
		const component = await mountMention(baseProps);

		const link = component.find('a[href="https://github.com/RedStar071"]');
		expect(link.exists()).toBe(true);
		expect(link.text()).toContain("RedStar");
		expect(link.text()).toContain("@RedStar071");
		expect(link.attributes("target")).toBe("_blank");
		expect(link.attributes("rel")).toContain("noopener");
	});

	it("shows contributor details in the tooltip when open", async () => {
		const component = await mountMention(baseProps, true);

		await nextTick();

		const bodyText = document.body.textContent ?? "";
		expect(bodyText).toContain("RedStar");
		expect(bodyText).toContain("@RedStar071");
		expect(bodyText).toContain("Commits");
		expect(bodyText).toContain("On this repo");
		expect(bodyText).toContain("Contributed here");
		expect(bodyText).toContain("1,847");
		expect(bodyText).toContain("Yes");
		expect(component.exists()).toBe(true);
	});

	it("shows No when hasContributed is false", async () => {
		const component = await mountMention(
			{
				...baseProps,
				commits: 0,
				hasContributed: false,
			},
			true,
		);

		await nextTick();

		const bodyText = document.body.textContent ?? "";
		expect(bodyText).toContain("Contributed here");
		expect(bodyText).toContain("No");
		expect(component.exists()).toBe(true);
	});
});

describe("ChangelogContributors", () => {
	it("renders a unique heading and list of contributor mentions", async () => {
		const component = await mountContributorsList([baseProps], "v1.2.3");

		expect(component.find("#v1-2-3-contributors").exists()).toBe(true);
		expect(component.find("#v1-2-3-contributors").text()).toBe("Contributors");
		expect(component.findAll("li")).toHaveLength(1);
		expect(component.text()).toContain("RedStar (@RedStar071)");
	});

	it("renders nothing when the contributors list is empty", async () => {
		const component = await mountContributorsList([], "v0.0.1");

		expect(component.find("section").exists()).toBe(false);
	});
});
