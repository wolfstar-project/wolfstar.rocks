import { describe, expect, it, vi } from "vitest";

// auditDiff is a vi.fn() so tests can override it with mockReturnValueOnce.
// The default implementation is a shallow JSON-patch diff sufficient for most tests.
vi.mock("evlog", () => ({
	auditDiff: vi.fn((before: Record<string, unknown>, after: Record<string, unknown>) => {
		const patch: Array<{ op: string; path: string; value?: unknown }> = [];
		for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
			const bVal = before[key];
			const aVal = after[key];
			if (!(key in after)) patch.push({ op: "remove", path: `/${key}` });
			else if (!(key in before)) patch.push({ op: "add", path: `/${key}`, value: aVal });
			else if (JSON.stringify(bVal) !== JSON.stringify(aVal))
				patch.push({ op: "replace", path: `/${key}`, value: aVal });
		}
		return { patch };
	}),
}));

import { patchToChanges } from "#server/utils/audit/patch-to-changes";

describe("patchToChanges", () => {
	it("returns empty object when all ops are equivalent defaults", () => {
		const result = patchToChanges({ before: { x: [], y: null }, after: { x: [], y: null } });
		expect(result).toEqual({});
	});

	it("captures simple scalar change", () => {
		const result = patchToChanges({ before: { prefix: "!" }, after: { prefix: "?" } });
		expect(result).toEqual({ changed: { prefix: { from: "!", to: "?" } } });
	});

	it("captures array addition", () => {
		const result = patchToChanges({ before: { roles: [] }, after: { roles: ["r1", "r2"] } });
		expect(result.changed ?? result.added).toBeDefined();
		const key = result.changed?.["roles"] ?? result.added?.["roles"];
		expect(key).toBeDefined();
	});

	it("skips default-churn replaces (null <-> undefined, empty arrays)", () => {
		const result = patchToChanges({
			before: { x: null, y: [] },
			after: { x: undefined, y: [] },
		});
		expect(result).toEqual({});
	});

	it("produces dotted path for nested key", async () => {
		// The mock auditDiff is shallow-only, so we test the dotted-path transform.
		// We override the mock to emit a patch with a nested path.
		const { auditDiff } = await import("evlog");
		vi.mocked(auditDiff).mockReturnValueOnce({
			patch: [{ op: "replace", path: "/a/b", value: 2 }],
		} as ReturnType<typeof auditDiff>);

		const result = patchToChanges({ before: { a: { b: 1 } }, after: { a: { b: 2 } } });
		expect(result.changed?.["a.b"]).toEqual({ from: 1, to: 2 });
	});

	it("deduplicates parent-collision keys, keeping only the deeper key", async () => {
		const { auditDiff } = await import("evlog");
		vi.mocked(auditDiff).mockReturnValueOnce({
			patch: [
				{ op: "replace", path: "/foo", value: { bar: "new" } },
				{ op: "replace", path: "/foo/bar", value: "new" },
			],
		} as ReturnType<typeof auditDiff>);

		const result = patchToChanges({
			before: { foo: { bar: "old" } },
			after: { foo: { bar: "new" } },
		});
		expect(result.changed?.["foo.bar"]).toBeDefined();
		expect(result.changed?.["foo"]).toBeUndefined();
	});

	it("enforces the 25-op cap", () => {
		const before: Record<string, unknown> = {};
		const after: Record<string, unknown> = {};
		for (let i = 0; i < 30; i++) {
			before[`k${i}`] = i;
			after[`k${i}`] = i + 100;
		}
		const result = patchToChanges({ before, after });
		const total =
			Object.keys(result.changed ?? {}).length +
			Object.keys(result.added ?? {}).length +
			Object.keys(result.removed ?? {}).length;
		expect(total).toBeLessThanOrEqual(25);
	});
});
