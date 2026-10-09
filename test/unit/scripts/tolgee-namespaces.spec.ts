import { describe, expect, it } from "vitest";
import { planPullNamespaces } from "../../../scripts/utils/tolgee-namespaces";

const namespaces = ["common", "errors", "marketing"];
const unpushedNamespaces = ["errors", "marketing"];

function filesFor(pulled: Record<string, string[]>) {
	return (tag: string, ns: string) => pulled[tag]?.includes(ns) ?? false;
}

describe("planPullNamespaces", () => {
	it("skips declared-unpushed namespaces absent from every language", () => {
		const plan = planPullNamespaces({
			namespaces,
			unpushedNamespaces,
			tags: ["en", "it"],
			hasPulledFile: filesFor({ en: ["common"], it: ["common"] }),
		});
		expect(plan).toEqual({ active: ["common"], skipped: ["errors", "marketing"], missing: [] });
	});

	it("syncs an unpushed namespace normally once the platform has it", () => {
		const plan = planPullNamespaces({
			namespaces,
			unpushedNamespaces,
			tags: ["en", "it"],
			hasPulledFile: filesFor({
				en: ["common", "errors", "marketing"],
				it: ["common", "errors", "marketing"],
			}),
		});
		expect(plan.active).toEqual(namespaces);
		expect(plan.skipped).toEqual([]);
		expect(plan.missing).toEqual([]);
	});

	it("reports an undeclared namespace absent from every language as missing", () => {
		const plan = planPullNamespaces({
			namespaces,
			unpushedNamespaces: ["marketing"],
			tags: ["en", "it"],
			hasPulledFile: filesFor({ en: ["common"], it: ["common"] }),
		});
		expect(plan.skipped).toEqual(["marketing"]);
		expect(plan.missing).toEqual(["en/errors.json", "it/errors.json"]);
	});

	it("reports a namespace missing from only some languages, even when declared unpushed", () => {
		const plan = planPullNamespaces({
			namespaces,
			unpushedNamespaces,
			tags: ["en", "it"],
			hasPulledFile: filesFor({
				en: ["common", "errors"],
				it: ["common"],
			}),
		});
		expect(plan.skipped).toEqual(["marketing"]);
		expect(plan.active).toEqual(["common", "errors"]);
		expect(plan.missing).toEqual(["it/errors.json"]);
	});

	it("leaves no active namespaces when everything is skipped", () => {
		const plan = planPullNamespaces({
			namespaces: ["errors"],
			unpushedNamespaces: ["errors"],
			tags: ["en"],
			hasPulledFile: () => false,
		});
		expect(plan.active).toEqual([]);
	});
});
