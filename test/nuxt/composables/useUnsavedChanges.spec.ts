import type { Ref } from "vue";
import type { Router } from "vue-router";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";

interface RouteArg {
	fullPath: string;
	path: string;
}
type GuardFn = (to: RouteArg, from: RouteArg) => unknown;

function makeRoute(path: string): RouteArg {
	return { fullPath: path, path };
}

describe("useUnsavedChanges", () => {
	let capturedGuard: GuardFn | undefined;
	let mockBeforeEach: ReturnType<typeof vi.fn>;
	let mockPush: ReturnType<typeof vi.fn>;

	// oxlint-disable-next-line vitest/no-hooks
	beforeEach(() => {
		capturedGuard = undefined;
	});

	// oxlint-disable-next-line vitest/no-hooks
	afterEach(() => {
		vi.restoreAllMocks();
	});

	async function setupComposable(hasChanges: Ref<boolean>) {
		let composable: ReturnType<typeof useUnsavedChanges> | undefined;
		mockBeforeEach = vi.fn((guard: GuardFn) => {
			capturedGuard = guard;
			return vi.fn();
		});
		mockPush = vi.fn();

		const TestComponent = defineComponent({
			setup() {
				const router = useRouter() as Router;
				vi.spyOn(router, "beforeEach").mockImplementation(mockBeforeEach as any);
				vi.spyOn(router, "push").mockImplementation(mockPush as any);
				composable = useUnsavedChanges(hasChanges);
				return () => null;
			},
		});

		await mountSuspended(TestComponent);
		return composable!;
	}

	it("should register a route guard on init", async () => {
		await setupComposable(ref(false));

		// oxlint-disable-next-line vitest/prefer-called-times
		expect(mockBeforeEach).toHaveBeenCalledOnce();
	});

	it("should not block navigation when there are no unsaved changes", async () => {
		await setupComposable(ref(false));

		const result = capturedGuard!(
			makeRoute("/guilds"),
			makeRoute("/guilds/123456789012345678/manage"),
		);

		expect(result).toBeUndefined();
	});

	it("should block navigation and show dialog when navigating away with unsaved changes", async () => {
		const composable = await setupComposable(ref(true));

		const result = capturedGuard!(
			makeRoute("/guilds"),
			makeRoute("/guilds/123456789012345678/manage"),
		);

		expect(result).toBeFalsy();
		expect(composable.showDialog.value).toBeTruthy();
	});

	it("should not block navigation within the same guild manage area", async () => {
		const composable = await setupComposable(ref(true));

		const result = capturedGuard!(
			makeRoute("/guilds/123456789012345678/manage/channels"),
			makeRoute("/guilds/123456789012345678/manage"),
		);

		expect(result).toBeUndefined();
		expect(composable.showDialog.value).toBeFalsy();
	});

	it("should not block navigation between filter sub-paths of the same guild", async () => {
		const composable = await setupComposable(ref(true));

		const result = capturedGuard!(
			makeRoute("/guilds/123456789012345678/manage/filter/links"),
			makeRoute("/guilds/123456789012345678/manage/filter/words"),
		);

		expect(result).toBeUndefined();
		expect(composable.showDialog.value).toBeFalsy();
	});

	it("confirmLeave should navigate to the pending route and close the dialog", async () => {
		const composable = await setupComposable(ref(true));

		capturedGuard!(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));
		expect(composable.showDialog.value).toBeTruthy();

		composable.confirmLeave();

		expect(composable.showDialog.value).toBeFalsy();
		expect(mockPush).toHaveBeenCalledWith("/guilds");
	});

	it("cancelLeave should close the dialog without navigating", async () => {
		const composable = await setupComposable(ref(true));

		capturedGuard!(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));
		expect(composable.showDialog.value).toBeTruthy();

		composable.cancelLeave();

		expect(composable.showDialog.value).toBeFalsy();
		expect(mockPush).not.toHaveBeenCalled();
	});

	it("skipGuard should allow navigation to proceed after confirmLeave without re-blocking", async () => {
		const composable = await setupComposable(ref(true));

		// Block the navigation
		capturedGuard!(makeRoute("/guilds"), makeRoute("/guilds/123456789012345678/manage"));

		// Confirm leave sets skipGuard = true
		composable.confirmLeave();

		// Next guard invocation should pass through (skipGuard resets it)
		const result = capturedGuard!(
			makeRoute("/guilds"),
			makeRoute("/guilds/123456789012345678/manage"),
		);
		expect(result).toBeUndefined();
	});
});
