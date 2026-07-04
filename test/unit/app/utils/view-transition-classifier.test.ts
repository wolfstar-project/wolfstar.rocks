import { describe, expect, it } from "vitest";
import { classifyNavigation } from "~/utils/view-transition-classifier";

describe("classifyNavigation", () => {
	it("tags nav-forward + route-marketing for a marketing forward nav", () => {
		const result = classifyNavigation({
			toPath: "/wolfstar",
			fromPath: "/",
			isPopstate: false,
		});
		expect(result).toEqual(["nav-forward", "route-marketing"]);
	});

	it("tags nav-back + route-marketing for a popstate back nav on marketing", () => {
		const result = classifyNavigation({
			toPath: "/",
			fromPath: "/wolfstar",
			isPopstate: true,
			hasUAVisualTransition: false,
		});
		expect(result).toEqual(["nav-back", "route-marketing"]);
	});

	it("tags nav-forward + route-dashboard for a guild nav", () => {
		const result = classifyNavigation({
			toPath: "/guilds/123/manage",
			fromPath: "/",
			isPopstate: false,
		});
		expect(result).toEqual(["nav-forward", "route-dashboard"]);
	});

	it("returns empty array for oauth routes", () => {
		const result = classifyNavigation({
			toPath: "/oauth/login",
			fromPath: "/",
			isPopstate: false,
		});
		expect(result).toEqual([]);
	});

	it("returns empty array for same-path reload-equivalent nav", () => {
		const result = classifyNavigation({ toPath: "/", fromPath: "/", isPopstate: false });
		expect(result).toEqual([]);
	});

	it("tags nav-forward + route-marketing for forward nav to /blog", () => {
		const result = classifyNavigation({
			toPath: "/blog",
			fromPath: "/",
			isPopstate: false,
		});
		expect(result).toEqual(["nav-forward", "route-marketing"]);
	});

	it("tags nav-forward + route-marketing for forward nav to a blog post slug", () => {
		const result = classifyNavigation({
			toPath: "/blog/wolfstar-v7",
			fromPath: "/blog",
			isPopstate: false,
		});
		expect(result).toEqual(["nav-forward", "route-marketing"]);
	});

	it("tags nav-back + route-marketing for popstate back nav to /blog", () => {
		const result = classifyNavigation({
			toPath: "/blog",
			fromPath: "/blog/wolfstar-v7",
			isPopstate: true,
			hasUAVisualTransition: false,
		});
		expect(result).toEqual(["nav-back", "route-marketing"]);
	});
});
