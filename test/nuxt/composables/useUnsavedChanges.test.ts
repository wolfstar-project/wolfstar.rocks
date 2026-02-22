import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

const { mockBeforeEach, mockPush } = vi.hoisted(() => ({
	mockBeforeEach: vi.fn(() => vi.fn()),
	mockPush: vi.fn(),
}));

mockNuxtImport("useRouter", () => () => ({
	beforeEach: mockBeforeEach,
	push: mockPush,
}));

function makeRoute(path: string) {
	return { fullPath: path, path } as { fullPath: string; path: string };
}

describe("useUnsavedChanges", () => {
	// oxlint-disable-next-line vitest/no-hooks
	beforeEach(() => {
		vi.clearAllMocks();
		mockBeforeEach.mockReturnValue(vi.fn());
	});

	it("should register a route guard on init", () => {
		useUnsavedChanges(ref(false));

		// oxlint-disable-next-line vitest/prefer-called-times
		expect(mockBeforeEach).toHaveBeenCalledOnce();
	});

	it("should not block navigation when there are no unsaved changes", () => {
		useUnsavedChanges(ref(false));
		const guard = mockBeforeEach.mock.calls[0][0] as Function;

		const result = guard(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));

		expect(result).toBeUndefined();
	});

	it("should block navigation and show dialog when navigating away with unsaved changes", () => {
		const { showDialog } = useUnsavedChanges(ref(true));
		const guard = mockBeforeEach.mock.calls[0][0] as Function;

		const result = guard(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));

		expect(result).toBeFalsy();
		expect(showDialog.value).toBeTruthy();
	});

	it("should not block navigation within the same guild manage area", () => {
		const { showDialog } = useUnsavedChanges(ref(true));
		const guard = mockBeforeEach.mock.calls[0][0] as Function;

		const result = guard(
			makeRoute("/guilds/123456789012345678/manage/channels"),
			makeRoute("/guilds/123456789012345678/manage"),
		);

		expect(result).toBeUndefined();
		expect(showDialog.value).toBeFalsy();
	});

	it("should not block navigation between filter sub-paths of the same guild", () => {
		const { showDialog } = useUnsavedChanges(ref(true));
		const guard = mockBeforeEach.mock.calls[0][0] as Function;

		const result = guard(
			makeRoute("/guilds/123456789012345678/manage/filter/links"),
			makeRoute("/guilds/123456789012345678/manage/filter/words"),
		);

		expect(result).toBeUndefined();
		expect(showDialog.value).toBeFalsy();
	});

	it("confirmLeave should navigate to the pending route and close the dialog", () => {
		const { confirmLeave, showDialog } = useUnsavedChanges(ref(true));
		const guard = mockBeforeEach.mock.calls[0][0] as Function;

		guard(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));
		expect(showDialog.value).toBeTruthy();

		confirmLeave();

		expect(showDialog.value).toBeFalsy();
		expect(mockPush).toHaveBeenCalledWith("/guilds");
	});

	it("cancelLeave should close the dialog without navigating", () => {
		const { cancelLeave, showDialog } = useUnsavedChanges(ref(true));
		const guard = mockBeforeEach.mock.calls[0][0] as Function;

		guard(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));
		expect(showDialog.value).toBeTruthy();

		cancelLeave();

		expect(showDialog.value).toBeFalsy();
		expect(mockPush).not.toHaveBeenCalled();
	});

	it("skipGuard should allow navigation to proceed after confirmLeave without re-blocking", () => {
		const { confirmLeave } = useUnsavedChanges(ref(true));
		const guard = mockBeforeEach.mock.calls[0][0] as Function;

		// Block the navigation
		guard(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));

		// Confirm leave sets skipGuard = true
		confirmLeave();

		// Next guard invocation should pass through (skipGuard resets it)
		const result = guard(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));
		expect(result).toBeUndefined();
	});
});
