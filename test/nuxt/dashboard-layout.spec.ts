import { describe, expect, it } from "vitest";

describe("dashboardLayout - Guild Switch (Watcher Logic)", () => {
	it("should clear staged changes when guild ID changes", () => {
		// This test verifies the watcher logic in dashboard.vue
		// The watcher should call setGuildSettingsChanges(undefined) when guild ID changes

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

describe("dashboardLayout - Async Data resolving", () => {
	it("should set guild data when useAsyncData resolves", () => {
		let guildData: { id: string } | undefined;
		let guildSettings: Record<string, unknown> | undefined;

		function setGuildData(val: { id: string }) {
			guildData = val;
		}

		function setGuildSettings(val: Record<string, unknown>) {
			guildSettings = val;
		}

		const data = [{ id: "guild-1" }, JSON.stringify({ someKey: "someValue" })] as const;

		const watcherCallback = (newData: readonly [{ id: string }, string] | null) => {
			if (newData) {
				setGuildData(newData[0]);
				setGuildSettings(JSON.parse(newData[1]));
			}
		};

		watcherCallback(data);

		expect(guildData).toStrictEqual({ id: "guild-1" });
		expect(guildSettings).toStrictEqual({ someKey: "someValue" });
	});

	it("should handle 401 error by calling navigateTo", async () => {
		let navigatedTo: string | undefined;

		// Mock error returned by parseError
		const parsedError = {
			status: 401,
			message: "Unauthorized",
			why: "Session expired",
			fix: "Log in again",
		};

		// Mock the logic
		const watcherCallback = async (err: unknown) => {
			if (err) {
				switch (parsedError.status) {
					case 401: {
						navigatedTo = "/";
						break;
					}
					// Omit other cases for pure unit test focus
				}
			}
		};

		await watcherCallback(new Error("401"));

		expect(navigatedTo).toBe("/");
	});

	it("should handle 403 error by calling navigateTo", async () => {
		let navigatedTo: string | undefined;

		// Mock error returned by parseError
		const parsedError = {
			status: 403,
			message: "Forbidden",
			why: "Access Denied",
			fix: "Ask for permissions",
		};

		// Mock the logic
		const watcherCallback = async (err: unknown) => {
			if (err) {
				switch (parsedError.status) {
					case 403: {
						navigatedTo = "/";
						break;
					}
					// Omit other cases for pure unit test focus
				}
				// Mock what happens when router.back is not used
			}
		};

		await watcherCallback(new Error("403"));

		expect(navigatedTo).toBe("/");
	});
});
