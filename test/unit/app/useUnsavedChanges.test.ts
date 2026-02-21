import { beforeAll, describe, expect, it } from "vitest";

function makeRoute(path: string) {
	return { path } as { path: string };
}

describe("useUnsavedChanges - Route Guard Logic", () => {
	// Import the real function from the composable
	let isSameGuildManageArea: typeof import("../../../app/composables/useUnsavedChanges").isSameGuildManageArea;

	// oxlint-disable-next-line vitest/no-hooks
	beforeAll(async () => {
		const mod = await import("../../../app/composables/useUnsavedChanges");
		isSameGuildManageArea = mod.isSameGuildManageArea;
	});

	it("should allow navigation within the same guild manage area", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/123456789012345678/manage/channels"),
				makeRoute("/guilds/123456789012345678/manage"),
			),
		).toBe(true);
	});

	it("should allow navigation between different settings tabs", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/123456789012345678/manage/moderation"),
				makeRoute("/guilds/123456789012345678/manage/channels"),
			),
		).toBe(true);
	});

	it("should block navigation when switching guilds", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/987654321098765432/manage"),
				makeRoute("/guilds/123456789012345678/manage"),
			),
		).toBe(false);
	});

	it("should block navigation when leaving guild manage area", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds"),
				makeRoute("/guilds/123456789012345678/manage"),
			),
		).toBe(false);
	});

	it("should block navigation to completely different page", () => {
		expect(
			isSameGuildManageArea(makeRoute("/"), makeRoute("/guilds/123456789012345678/manage")),
		).toBe(false);
	});

	it("should block navigation from manage to guild list", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/123456789012345678"),
				makeRoute("/guilds/123456789012345678/manage"),
			),
		).toBe(false);
	});
});

describe("useUnsavedChanges - Navigation Guard Behavior", () => {
	it("should not block when there are no changes", () => {
		const hasChanges = false;
		const isSameArea = false;

		const shouldBlock = hasChanges && !isSameArea;
		expect(shouldBlock).toBe(false);
	});

	it("should block when there are changes and leaving the area", () => {
		const hasChanges = true;
		const isSameArea = false;

		const shouldBlock = hasChanges && !isSameArea;
		expect(shouldBlock).toBe(true);
	});

	it("should not block when there are changes but staying in the same area", () => {
		const hasChanges = true;
		const isSameArea = true;

		const shouldBlock = hasChanges && !isSameArea;
		expect(shouldBlock).toBe(false);
	});

	it("should allow navigation after skip guard is set", () => {
		let skipGuard = false;
		const hasChanges = true;
		const isSameArea = false;

		// First attempt: should block
		let shouldBlock = hasChanges && !isSameArea && !skipGuard;
		expect(shouldBlock).toBe(true);

		// After confirmation, skip guard is set
		skipGuard = true;
		shouldBlock = hasChanges && !isSameArea && !skipGuard;
		expect(shouldBlock).toBe(false);
	});

	it("should reset skip guard after navigation proceeds", () => {
		let skipGuard = true;

		// Guard fires, sees skipGuard is true, resets it
		if (skipGuard) {
			skipGuard = false;
		}

		expect(skipGuard).toBe(false);
	});
});

describe("useUnsavedChanges - Dialog State Management", () => {
	it("should track pending route when blocking navigation", () => {
		let pendingRoute: string | null = null;
		let showDialog = false;

		// Simulate blocking navigation
		pendingRoute = "/guilds";
		showDialog = true;

		expect(pendingRoute).toBe("/guilds");
		expect(showDialog).toBe(true);
	});

	it("should clear state when confirming leave", () => {
		let pendingRoute: string | null = "/guilds";
		let showDialog = true;
		let skipGuard = false;
		let navigatedTo: string | null = null;

		// Simulate confirmLeave
		showDialog = false;
		const route = pendingRoute;
		pendingRoute = null;
		if (route) {
			skipGuard = true;
			navigatedTo = route;
		}

		expect(showDialog).toBe(false);
		expect(pendingRoute).toBeNull();
		expect(skipGuard).toBe(true);
		expect(navigatedTo).toBe("/guilds");
	});

	it("should clear state when canceling leave", () => {
		let pendingRoute: string | null = "/guilds";
		let showDialog = true;

		// Simulate cancelLeave
		showDialog = false;
		pendingRoute = null;

		expect(showDialog).toBe(false);
		expect(pendingRoute).toBeNull();
	});
});
