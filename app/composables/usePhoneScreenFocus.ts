import type { ShallowRef } from "vue";

function focusedIn(container: HTMLElement | null): HTMLElement | null {
	const focused = document.activeElement;
	return focused instanceof HTMLElement && container?.contains(focused) ? focused : null;
}

/**
 * Moves the focus with the phone's two screens of `/app`, since each hides the
 * control that had it: to the page's title when the page opens, and back to
 * the item of the list that opened it when the list returns, whether the
 * page's back button or the browser's brought it back.
 *
 * Called once, by the layout that holds both screens.
 */
export function usePhoneScreenFocus(
	list: Readonly<ShallowRef<HTMLElement | null>>,
	page: Readonly<ShallowRef<HTMLElement | null>>,
) {
	const { isPhone, screen } = usePhoneScreen();
	let opener: HTMLElement | null = null;

	watch(screen, async (next) => {
		if (!isPhone.value) return;
		// Watchers run before the screens swap, while the item that opened the
		// page still holds the focus.
		if (next === "page") opener = focusedIn(list.value);
		await nextTick();

		const target =
			next === "page"
				? page.value?.querySelector<HTMLElement>("h1")
				: opener?.isConnected
					? opener
					: list.value?.querySelector<HTMLElement>('[aria-current="page"]');
		target?.focus();
	});
}
