import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import ChangelogContributorMention from "~/components/changelog/ContributorMention.vue";
import ChangelogContributors from "~/components/changelog/Contributors.vue";

const baseProps = {
	name: "RedStar",
	username: "RedStar071",
	commits: 1847,
	hasContributed: true,
	avatarSrc: "https://github.com/RedStar071.png",
};

describe("ChangelogContributorMention", () => {
	it("renders the display name and username as a GitHub profile link", async () => {
		const component = await mountSuspended(ChangelogContributorMention, {
			props: baseProps,
		});

		const link = component.find('a[href="https://github.com/RedStar071"]');
		expect(link.exists()).toBe(true);
		expect(link.text()).toContain("RedStar");
		expect(link.text()).toContain("@RedStar071");
		expect(link.attributes("target")).toBe("_blank");
		expect(link.attributes("rel")).toContain("noopener");
	});

	it("shows contributor details in the hover card when open", async () => {
		const component = await mountSuspended(ChangelogContributorMention, {
			props: baseProps,
			attrs: { "default-open": true },
		});

		// Hover-card content is portaled; query the document body.
		const bodyText = document.body.textContent ?? "";
		expect(bodyText).toContain("RedStar");
		expect(bodyText).toContain("@RedStar071");
		expect(bodyText).toContain("1,847");
		expect(bodyText).toContain("Contributed to this repository");
		expect(component.exists()).toBe(true);
	});

	it("shows the non-contributor status when hasContributed is false", async () => {
		const component = await mountSuspended(ChangelogContributorMention, {
			props: {
				...baseProps,
				commits: 0,
				hasContributed: false,
			},
			attrs: { "default-open": true },
		});

		const bodyText = document.body.textContent ?? "";
		expect(bodyText).toContain("Not listed as a repository contributor");
		expect(component.exists()).toBe(true);
	});
});

describe("ChangelogContributors", () => {
	it("renders a unique heading and list of contributor mentions", async () => {
		const component = await mountSuspended(ChangelogContributors, {
			props: {
				idPrefix: "v1.2.3",
				contributors: [baseProps],
			},
		});

		expect(component.find("#v1-2-3-contributors").exists()).toBe(true);
		expect(component.find("#v1-2-3-contributors").text()).toBe("Contributors");
		expect(component.findAll("li")).toHaveLength(1);
		expect(component.text()).toContain("RedStar (@RedStar071)");
	});

	it("renders nothing when the contributors list is empty", async () => {
		const component = await mountSuspended(ChangelogContributors, {
			props: {
				idPrefix: "v0.0.1",
				contributors: [],
			},
		});

		expect(component.find("section").exists()).toBe(false);
	});
});
