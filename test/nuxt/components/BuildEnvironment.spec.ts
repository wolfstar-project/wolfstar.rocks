import type { BuildInfo } from "#shared/types";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import BuildEnvironment from "~/components/BuildEnvironment.vue";

describe("BuildEnvironment", () => {
	it("renders dev environment correctly", async () => {
		const buildInfo: BuildInfo = {
			env: "dev",
			version: "1.2.3",
			time: 1234567890,
			commit: "abcdef",
			shortCommit: "abc",
			branch: "main",
			privacyPolicyDate: new Date().toISOString(),
			termsDate: new Date().toISOString(),
			prNumber: null,
		};
		const component = await mountSuspended(BuildEnvironment, {
			props: {
				buildInfo,
			},
		});

		// In dev mode, it shows env name, not version link
		const envSpan = component.find("span.tracking-wider");
		expect(envSpan.exists()).toBe(true);
		expect(envSpan.text()).toBe(buildInfo.env);

		const commitLink = component.find(`a[href$="/commit/${buildInfo.commit}"]`);
		expect(commitLink.exists()).toBe(true);

		const tagLink = component.find(`a[href$="/tag/v${buildInfo.version}"]`);
		expect(tagLink.exists()).toBe(false);
	});

	it("renders canary environment correctly", async () => {
		const buildInfo: BuildInfo = {
			env: "canary",
			version: "1.2.3",
			time: 1234567890,
			commit: "abcdef",
			shortCommit: "abc",
			branch: "main",
			privacyPolicyDate: new Date().toISOString(),
			termsDate: new Date().toISOString(),
			prNumber: null,
		};
		const component = await mountSuspended(BuildEnvironment, {
			props: {
				buildInfo,
			},
		});

		// In canary mode, it shows env name, not version link
		const envSpan = component.find("span.tracking-wider");
		expect(envSpan.exists()).toBe(true);
		expect(envSpan.text()).toBe("canary");

		const commitLink = component.find(`a[href$="/commit/${buildInfo.commit}"]`);
		expect(commitLink.exists()).toBe(true);

		const tagLink = component.find(`a[href$="/tag/v${buildInfo.version}"]`);
		expect(tagLink.exists()).toBe(false);
	});

	it("renders preview environment correctly", async () => {
		const buildInfo: BuildInfo = {
			env: "preview",
			version: "1.2.3",
			time: 1234567890,
			commit: "abcdef",
			shortCommit: "abc",
			branch: "feat/new-feature",
			privacyPolicyDate: new Date().toISOString(),
			termsDate: new Date().toISOString(),
			prNumber: "42",
		};
		const component = await mountSuspended(BuildEnvironment, {
			props: {
				buildInfo,
			},
		});

		// In preview mode, it shows env name, not version link
		const envSpan = component.find("span.tracking-wider");
		expect(envSpan.exists()).toBe(true);
		expect(envSpan.text()).toBe("preview");

		const commitLink = component.find(`a[href$="/commit/${buildInfo.commit}"]`);
		expect(commitLink.exists()).toBe(true);

		const tagLink = component.find(`a[href$="/tag/v${buildInfo.version}"]`);
		expect(tagLink.exists()).toBe(false);
	});

	it("renders release environment correctly", async () => {
		const buildInfo: BuildInfo = {
			env: "release",
			version: "1.2.3",
			time: 1234567890,
			commit: "abcdef",
			shortCommit: "abc",
			branch: "release",
			privacyPolicyDate: new Date().toISOString(),
			termsDate: new Date().toISOString(),
			prNumber: null,
		};

		const component = await mountSuspended(BuildEnvironment, {
			props: {
				buildInfo,
			},
		});

		// In release mode, it shows tag version link, not env name
		const envSpan = component.find("span.tracking-wider");
		expect(envSpan.exists()).toBe(false);

		const commitLink = component.find(`a[href$="/commit/${buildInfo.commit}"]`);
		expect(commitLink.exists()).toBe(false);

		const tagLink = component.find(`a[href$="/tag/v${buildInfo.version}"]`);
		expect(tagLink.exists()).toBe(true);
	});

	it("applies footer classes when footer prop is true", async () => {
		const buildInfo: BuildInfo = {
			env: "dev",
			version: "1.2.3",
			time: 1234567890,
			commit: "abcdef",
			shortCommit: "abc",
			branch: "main",
			privacyPolicyDate: new Date().toISOString(),
			termsDate: new Date().toISOString(),
			prNumber: null,
		};
		const component = await mountSuspended(BuildEnvironment, {
			props: {
				buildInfo,
				footer: true,
			},
		});

		const container = component.find("div");
		expect(container.classes()).toContain("mt-4");
		expect(container.classes()).toContain("items-end");
		expect(container.classes()).toContain("gap-4");
	});

	it("applies default classes when footer prop is false", async () => {
		const buildInfo: BuildInfo = {
			env: "dev",
			version: "1.2.3",
			time: 1234567890,
			commit: "abcdef",
			shortCommit: "abc",
			branch: "main",
			privacyPolicyDate: new Date().toISOString(),
			termsDate: new Date().toISOString(),
			prNumber: null,
		};
		const component = await mountSuspended(BuildEnvironment, {
			props: {
				buildInfo,
			},
		});

		const container = component.find("div");
		expect(container.classes()).toContain("mb-8");
		expect(container.classes()).toContain("items-center");
		expect(container.classes()).toContain("justify-center");
		expect(container.classes()).toContain("gap-2");
	});

	it("hides commit link when branch is release", async () => {
		const buildInfo: BuildInfo = {
			env: "dev",
			version: "1.2.3",
			time: 1234567890,
			commit: "abcdef",
			shortCommit: "abc",
			branch: "release",
			privacyPolicyDate: new Date().toISOString(),
			termsDate: new Date().toISOString(),
			prNumber: null,
		};
		const component = await mountSuspended(BuildEnvironment, {
			props: {
				buildInfo,
			},
		});

		const commitLink = component.find(`a[href$="/commit/${buildInfo.commit}"]`);
		expect(commitLink.exists()).toBe(false);
	});

	it("hides commit link when commit is empty", async () => {
		const buildInfo: BuildInfo = {
			env: "dev",
			version: "1.2.3",
			time: 1234567890,
			commit: "",
			shortCommit: "",
			branch: "main",
			privacyPolicyDate: new Date().toISOString(),
			termsDate: new Date().toISOString(),
			prNumber: null,
		};
		const component = await mountSuspended(BuildEnvironment, {
			props: {
				buildInfo,
			},
		});

		const commitLink = component.find(`a[href$="/commit/"]`);
		expect(commitLink.exists()).toBe(false);
	});
});
