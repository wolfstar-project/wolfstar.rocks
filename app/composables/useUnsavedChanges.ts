import type { Ref } from "vue";
import type { RouteLocationNormalized } from "vue-router";

const GUILD_MANAGE_PATTERN = /^\/guilds\/([^/]+)\/manage/;

export function isSameGuildManageArea(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
): boolean {
	const fromMatch = from.path.match(GUILD_MANAGE_PATTERN);
	const toMatch = to.path.match(GUILD_MANAGE_PATTERN);
	return Boolean(fromMatch && toMatch && fromMatch[1] === toMatch[1]);
}

export function useUnsavedChanges(hasChanges: Ref<boolean>) {
	const router = useRouter();
	const showDialog = ref(false);
	const pendingRoute = ref<string | null>(null);
	const skipGuard = ref(false);

	const removeGuard = router.beforeEach((to, from) => {
		if (skipGuard.value) {
			skipGuard.value = false;
			return;
		}

		if (hasChanges.value && !isSameGuildManageArea(to, from)) {
			pendingRoute.value = to.fullPath;
			showDialog.value = true;
			return false;
		}
	});

	useEventListener(window, "beforeunload", (e) => {
		if (hasChanges.value) {
			e.preventDefault();
			e.returnValue = "";
		}
	});

	onScopeDispose(removeGuard);

	function confirmLeave() {
		showDialog.value = false;
		const route = pendingRoute.value;
		pendingRoute.value = null;
		if (route) {
			skipGuard.value = true;
			router.push(route);
		}
	}

	function cancelLeave() {
		showDialog.value = false;
		pendingRoute.value = null;
	}

	return {
		cancelLeave,
		confirmLeave,
		showDialog,
	};
}
