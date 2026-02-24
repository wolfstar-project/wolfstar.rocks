import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

interface RouteArg {
	fullPath: string;
	path: string;
}
type GuardFn = (to: RouteArg, from: RouteArg) => unknown;

let capturedGuard: GuardFn | undefined;

const mockBeforeEach = vi.fn((guard: GuardFn) => {
	capturedGuard = guard;
	return vi.fn();
});
const mockPush = vi.fn();

mockNuxtImport("useRouter", () => () => ({
	beforeEach: mockBeforeEach,
	push: mockPush,
}));

function makeRoute(path: string): RouteArg {
	return { fullPath: path, path };
}

describe("useUnsavedChanges", () => {
	// oxlint-disable-next-line vitest/no-hooks
	beforeEach(() => {
		vi.clearAllMocks();
		capturedGuard = undefined;
	});

	it("should register a route guard on init", () => {
		useUnsavedChanges(ref(false));

		// oxlint-disable-next-line vitest/prefer-called-times
		expect(mockBeforeEach).toHaveBeenCalledOnce();
	});

	it("should not block navigation when there are no unsaved changes", () => {
		useUnsavedChanges(ref(false));

		const result = capturedGuard!(
			makeRoute("/guilds"),
			makeRoute("/guilds/123456789012345678/manage"),
		);

		expect(result).toBeUndefined();
	});

	it("should block navigation and show dialog when navigating away with unsaved changes", () => {
		const { showDialog } = useUnsavedChanges(ref(true));

		const result = capturedGuard!(
			makeRoute("/guilds"),
			makeRoute("/guilds/123456789012345678/manage"),
		);

		expect(result).toBeFalsy();
		expect(showDialog.value).toBeTruthy();
	});

	it("should not block navigation within the same guild manage area", () => {
		const { showDialog } = useUnsavedChanges(ref(true));

		const result = capturedGuard!(
			makeRoute("/guilds/123456789012345678/manage/channels"),
			makeRoute("/guilds/123456789012345678/manage"),
		);

		expect(result).toBeUndefined();
		expect(showDialog.value).toBeFalsy();
	});

	it("should not block navigation between filter sub-paths of the same guild", () => {
		const { showDialog } = useUnsavedChanges(ref(true));

		const result = capturedGuard!(
			makeRoute("/guilds/123456789012345678/manage/filter/links"),
			makeRoute("/guilds/123456789012345678/manage/filter/words"),
		);

		expect(result).toBeUndefined();
		expect(showDialog.value).toBeFalsy();
	});

	it("confirmLeave should navigate to the pending route and close the dialog", () => {
		const { confirmLeave, showDialog } = useUnsavedChanges(ref(true));

		capturedGuard!(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));
		expect(showDialog.value).toBeTruthy();

		confirmLeave();

		expect(showDialog.value).toBeFalsy();
		expect(mockPush).toHaveBeenCalledWith("/guilds");
	});

	it("cancelLeave should close the dialog without navigating", () => {
		const { cancelLeave, showDialog } = useUnsavedChanges(ref(true));

		capturedGuard!(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));
		expect(showDialog.value).toBeTruthy();

		cancelLeave();

		expect(showDialog.value).toBeFalsy();
		expect(mockPush).not.toHaveBeenCalled();
	});

	it("skipGuard should allow navigation to proceed after confirmLeave without re-blocking", () => {
		const { confirmLeave } = useUnsavedChanges(ref(true));

		// Block the navigation
		capturedGuard!(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));

		// Confirm leave sets skipGuard = true
		confirmLeave();

		// Next guard invocation should pass through (skipGuard resets it)
		const result = capturedGuard!(
			makeRoute("/guilds"),
			makeRoute("/guilds/123456789012345678/manage"),
		);
		expect(result).toBeUndefined();
	});
});
