import { describe, expect, it, vi } from "vitest";
import { classifyGuildError, parseGuildSettings } from "~/utils/guild-dashboard";

describe("guild-dashboard utilities - guild switch watcher simulation", () => {
	it("should clear staged changes when guild ID changes", () => {
		let stagedChanges: Record<string, unknown> | undefined = { some: "changes" };
		let guildId = "guild-1";

		function setGuildSettingsChanges(value: Record<string, unknown> | undefined) {
			stagedChanges = value;
		}

		// Simulate the watcher logic from dashboard.vue
		function watcherCallback(newGuildId: string, oldGuildId: string) {
			if (oldGuildId && newGuildId !== oldGuildId) {
				setGuildSettingsChanges(undefined);
			}
		}

		// Initial state: has changes
		expect(stagedChanges).toStrictEqual({ some: "changes" });

		// Simulate guild switch
		const oldGuildId = guildId;
		guildId = "guild-2";
		watcherCallback(guildId, oldGuildId);

		// Changes should be cleared
		expect(stagedChanges).toBeUndefined();
	});

	it("should not clear changes if guild ID is same", () => {
		let stagedChanges: Record<string, unknown> | undefined = { some: "changes" };
		const guildId = "guild-1";

		function setGuildSettingsChanges(value: Record<string, unknown> | undefined) {
			stagedChanges = value;
		}

		function watcherCallback(newGuildId: string, oldGuildId: string) {
			if (oldGuildId && newGuildId !== oldGuildId) {
				setGuildSettingsChanges(undefined);
			}
		}

		// Initial state: has changes
		expect(stagedChanges).toStrictEqual({ some: "changes" });

		// Simulate same guild ID (no change)
		const oldGuildId = guildId;
		watcherCallback(guildId, oldGuildId);

		// Changes should NOT be cleared
		expect(stagedChanges).toStrictEqual({ some: "changes" });
	});

	it("should not clear changes on initial mount (no old guild ID)", () => {
		let stagedChanges: Record<string, unknown> | undefined = { some: "changes" };

		function setGuildSettingsChanges(value: Record<string, unknown> | undefined) {
			stagedChanges = value;
		}

		function watcherCallback(newGuildId: string, oldGuildId: string | undefined) {
			if (oldGuildId && newGuildId !== oldGuildId) {
				setGuildSettingsChanges(undefined);
			}
		}

		// Initial state: has changes
		expect(stagedChanges).toStrictEqual({ some: "changes" });

		// Simulate initial guild ID set (no oldGuildId)
		watcherCallback("guild-1", undefined);

		// Changes should NOT be cleared (no old guild ID)
		expect(stagedChanges).toStrictEqual({ some: "changes" });
	});
});

describe("classifyGuildError", () => {
	it("classifies status 403 as forbidden", () => {
		expect(classifyGuildError(403)).toBe("forbidden");
	});

	it("classifies status 401 as unauthorized", () => {
		expect(classifyGuildError(401)).toBe("unauthorized");
	});

	it("classifies status 500 as default", () => {
		expect(classifyGuildError(500)).toBe("default");
	});

	it("classifies undefined status as default", () => {
		expect(classifyGuildError(undefined)).toBe("default");
	});

	it("classifies status 404 as default", () => {
		expect(classifyGuildError(404)).toBe("default");
	});
});

describe("parseGuildSettings", () => {
	it("parses valid JSON and returns the object", () => {
		const result = parseGuildSettings('{"key":"value"}', {});
		expect(result).toStrictEqual({ key: "value" });
	});

	it("returns the fallback when JSON is malformed", () => {
		const fallback = { existing: "data" };
		const result = parseGuildSettings("not-json", fallback);
		expect(result).toBe(fallback);
	});

	it("calls onError with the caught exception when JSON is malformed", () => {
		const onError = vi.fn();
		parseGuildSettings("{bad json", {}, onError);
		expect(onError).toHaveBeenCalledOnce();
		expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(SyntaxError);
	});

	it("does not call onError when JSON is valid", () => {
		const onError = vi.fn();
		parseGuildSettings('{"ok":true}', {}, onError);
		expect(onError).not.toHaveBeenCalled();
	});

	it("handles empty object JSON", () => {
		expect(parseGuildSettings("{}", {})).toStrictEqual({});
	});

	it("returns the fallback for non-object JSON (array)", () => {
		const fallback = { fallback: true };
		expect(parseGuildSettings("[1,2,3]", fallback)).toBe(fallback);
	});

	it("returns the fallback for non-object JSON (number)", () => {
		const fallback = { fallback: true };
		expect(parseGuildSettings("42", fallback)).toBe(fallback);
	});
});
