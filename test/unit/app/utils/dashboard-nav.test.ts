import type { DashboardNavGroup } from "~/utils/dashboard-nav";
import { describe, expect, it } from "vitest";
import {
	DASHBOARD_NAV,
	dashboardSkeletonKind,
	findDashboardNavItem,
	isModuleGroup,
} from "~/utils/dashboard-nav";
import enDashboard from "../../../../i18n/locales/en/dashboard.json" with { type: "json" };

function resolve(path: string): unknown {
	return path
		.split(".")
		.reduce<unknown>(
			(node, key) =>
				node && typeof node === "object"
					? (node as Record<string, unknown>)[key]
					: undefined,
			enDashboard,
		);
}

describe("DASHBOARD_NAV", () => {
	it("starts with the overview, which is the empty section slug", () => {
		expect(DASHBOARD_NAV[0]?.slug).toBe("");
		expect(findDashboardNavItem("")?.group).toBe("overview");
	});

	it("has one entry per section", () => {
		const slugs = DASHBOARD_NAV.map((item) => item.slug);

		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it("only labels sections with copy the English locale has", () => {
		const keys = DASHBOARD_NAV.map((item) => item.labelKey);
		const missing = keys.filter((key) => typeof resolve(key) !== "string");

		expect(missing).toStrictEqual([]);
	});

	it("sorts the modules into the categories, the events among them, and keeps Commands and Logs out", () => {
		const slugsOf = (group: DashboardNavGroup) =>
			DASHBOARD_NAV.filter((item) => item.group === group).map((item) => item.slug);

		expect(slugsOf("moderation")).toStrictEqual([
			"automod",
			"moderation",
			"joinguard",
			"honeypot",
			"appeals",
			"autodelete",
			"autopurge",
			"channels",
		]);
		expect(slugsOf("utility")).toStrictEqual(["roles", "automessage"]);
		expect(slugsOf("engagement")).toStrictEqual(["onboarding", "social"]);
		expect(slugsOf("tools")).toStrictEqual(["commands", "access", "logs"]);
		expect(findDashboardNavItem("commands")?.moduleKey).toBeUndefined();
	});

	// The events are switched by the `logs` flag of `Modules`. Neither of the
	// others has one: the appeals have a switch of their own, and the honeypot
	// is on once the bot has its channel.
	it("knows what turns the events, the honeypot and the appeals on", () => {
		expect(findDashboardNavItem("channels")?.moduleKey).toBe("modulesLogs");
		expect(findDashboardNavItem("appeals")?.moduleKey).toBe("appealsEnabled");
		expect(findDashboardNavItem("joinguard")?.moduleKey).toBe("joinGuardEnabled");
		expect(findDashboardNavItem("onboarding")?.moduleKey).toBe("onboardingEnabled");
		expect(findDashboardNavItem("honeypot")?.requiredKey).toBe("honeypotChannel");
	});

	// Staryl holds its switch: the dashboard has no setting to read it from.
	it("lists Staryl's Social with the engagement modules, without a switch of the settings", () => {
		expect(findDashboardNavItem("social")?.group).toBe("engagement");
		expect(findDashboardNavItem("social")?.moduleKey).toBeUndefined();
	});

	it("opens a page for every section, none of them announced only", () => {
		expect(DASHBOARD_NAV.filter((item) => item.comingSoon)).toStrictEqual([]);
	});

	it("tells the module categories from the overview and the tools", () => {
		expect(
			["moderation", "utility", "engagement"].every((id) =>
				isModuleGroup(id as DashboardNavGroup),
			),
		).toBe(true);
		expect(isModuleGroup("overview")).toBe(false);
		expect(isModuleGroup("tools")).toBe(false);
	});

	it("finds a section by its slug", () => {
		expect(findDashboardNavItem("logs")?.group).toBe("tools");
		expect(findDashboardNavItem("nowhere")).toBeUndefined();
	});
});

describe("dashboardSkeletonKind", () => {
	it("draws the overview, the tables and the settings pages each in their shape", () => {
		expect(dashboardSkeletonKind("")).toBe("overview");
		expect(dashboardSkeletonKind("modules")).toBe("modules");
		expect(dashboardSkeletonKind("logs")).toBe("table");
		expect(dashboardSkeletonKind("automod")).toBe("table");
		expect(dashboardSkeletonKind("autodelete")).toBe("table");
		expect(dashboardSkeletonKind("autopurge")).toBe("table");
		expect(dashboardSkeletonKind("social")).toBe("table");
		expect(dashboardSkeletonKind("automessage")).toBe("form");
		expect(dashboardSkeletonKind("moderation")).toBe("form");
		expect(dashboardSkeletonKind("roles")).toBe("form");
	});
});
