import { describe, expect, it } from "vitest";
import { DASHBOARD_NAV, dashboardSkeletonKind, findDashboardNavItem } from "~/utils/dashboard-nav";
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
		const keys = DASHBOARD_NAV.flatMap((item) => [
			item.labelKey,
			item.shortLabelKey ?? item.labelKey,
		]);
		const missing = keys.filter((key) => typeof resolve(key) !== "string");

		expect(missing).toStrictEqual([]);
	});

	it("finds a section by its slug", () => {
		expect(findDashboardNavItem("logs")?.group).toBe("records");
		expect(findDashboardNavItem("nowhere")).toBeUndefined();
	});
});

describe("dashboardSkeletonKind", () => {
	it("draws the overview, the tables and the settings pages each in their shape", () => {
		expect(dashboardSkeletonKind("")).toBe("overview");
		expect(dashboardSkeletonKind("modules")).toBe("modules");
		expect(dashboardSkeletonKind("logs")).toBe("table");
		expect(dashboardSkeletonKind("automod")).toBe("table");
		expect(dashboardSkeletonKind("moderation")).toBe("form");
		expect(dashboardSkeletonKind("roles")).toBe("form");
	});
});
