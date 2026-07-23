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

import { compactSettingsChanges, patchToChanges } from "#server/utils/audit/patch-to-changes";

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

describe("compactSettingsChanges (plan 008 write-time payload)", () => {
	it("stores only the changed field for a one-field update", () => {
		const before = { prefix: "!", language: "en-US", rolesAdmin: ["r1"] };
		const after = { prefix: "?", language: "en-US", rolesAdmin: ["r1"] };

		const compact = compactSettingsChanges(before, after);

		expect(compact.v).toBe(2);
		expect(compact.patch).toEqual([{ op: "replace", path: "/prefix", value: "?", from: "!" }]);
	});

	it("produces an empty patch for a no-op update", () => {
		const settings = { prefix: "!", rolesAdmin: ["r1"] };
		const compact = compactSettingsChanges({ ...settings }, { ...settings });
		expect(compact.patch).toEqual([]);
	});

	it("captures added and removed nullable fields with their old values", () => {
		const compact = compactSettingsChanges(
			{ rolesMuted: "role-1" },
			{ channelsLogsImage: "chan-1" },
		);

		const remove = compact.patch.find((op) => op.op === "remove");
		const add = compact.patch.find((op) => op.op === "add");
		expect(remove).toEqual({ op: "remove", path: "/rolesMuted", from: "role-1" });
		expect(add).toEqual({ op: "add", path: "/channelsLogsImage", value: "chan-1" });
	});

	it("passes through JSON-serialized BigInt-backed durations", () => {
		// serializeSettings turns BigInt durations into numbers/strings before
		// this function runs — verify those survive intact
		const compact = compactSettingsChanges(
			{ selfmodLinksHardActionDuration: null },
			{ selfmodLinksHardActionDuration: 60000 },
		);
		expect(compact.patch).toEqual([
			{ op: "replace", path: "/selfmodLinksHardActionDuration", value: 60000, from: null },
		]);
	});

	it("serializes far smaller than the legacy full snapshots for a representative update", () => {
		const manySettings: Record<string, unknown> = {};
		for (let i = 0; i < 150; i++) manySettings[`setting${i}`] = `value-${i}`;
		const before = { ...manySettings, prefix: "!" };
		const after = { ...manySettings, prefix: "?" };

		const legacyBytes = JSON.stringify({ before, after }).length;
		const compactBytes = JSON.stringify(compactSettingsChanges(before, after)).length;

		expect(compactBytes).toBeLessThan(legacyBytes / 10);
	});
});

describe("patchToChanges compact (v2) rows", () => {
	it("renders a v2 row identically to the equivalent legacy row", () => {
		const before = { prefix: "!", rolesAdmin: ["r1"], rolesMuted: "role-1" };
		const after = { prefix: "?", rolesAdmin: ["r1", "r2"] };

		const legacy = patchToChanges({ before, after });
		const compact = patchToChanges(
			compactSettingsChanges(before, after) as unknown as Record<string, unknown>,
		);

		expect(compact).toEqual(legacy);
	});

	it("reads a stored v2 payload without recomputing a diff", () => {
		const result = patchToChanges({
			v: 2,
			patch: [
				{ op: "replace", path: "/prefix", value: "?", from: "!" },
				{ op: "add", path: "/rolesPublic", value: ["r9"] },
				{ op: "remove", path: "/rolesMuted", from: "role-1" },
			],
		});

		expect(result).toEqual({
			added: { rolesPublic: ["r9"] },
			removed: { rolesMuted: "role-1" },
			changed: { prefix: { from: "!", to: "?" } },
		});
	});

	it("skips equivalent-default replaces in v2 rows", () => {
		const result = patchToChanges({
			v: 2,
			patch: [{ op: "replace", path: "/rolesAdmin", value: [], from: [] }],
		});
		expect(result).toEqual({});
	});

	it("returns empty groups for malformed or unknown-version payloads", () => {
		expect(
			patchToChanges({ v: 3, patch: "nope" } as unknown as Record<string, unknown>),
		).toEqual({});
		expect(
			patchToChanges({ v: 2, patch: [null, 42] } as unknown as Record<string, unknown>),
		).toEqual({});
	});
});
