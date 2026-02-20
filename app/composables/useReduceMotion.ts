/**
 * Composable to manage reduce motion preference
 * Respects both system preference and user override
 */
export function useReduceMotion() {
	const systemPrefersReducedMotion = usePreferredReducedMotion();
	const userReduceMotion = useLocalStorage("user-prefers-reduced-motion", false);

	// Sync reduceMotionEnabled with userReduceMotion using computed with setter
	const reduceMotionEnabled = computed({
		get: () => userReduceMotion.value,
		set: (value) => (userReduceMotion.value = value),
	});

	// Effective reduce motion: system preference takes precedence
	const effectiveReduceMotion = computed(
		() => systemPrefersReducedMotion.value === "reduce" || reduceMotionEnabled.value,
	);

	const systemPreferenceActive = computed(() => systemPrefersReducedMotion.value === "reduce");

	function setReduceMotion(value: boolean) {
		userReduceMotion.value = value;
	}

	// Automatically sync DOM attribute with effectiveReduceMotion using useDocumentVisibility
	if (import.meta.client) {
		const isDocumentVisible = useDocumentVisibility();

		// Use watchEffect to automatically update DOM when effectiveReduceMotion changes
		watchEffect(() => {
			// Only update if document is visible to avoid unnecessary work
			if (isDocumentVisible.value === "visible" || isDocumentVisible.value === "hidden") {
				if (effectiveReduceMotion.value) {
					document.documentElement.setAttribute("data-reduce-motion", "true");
				} else {
					document.documentElement.removeAttribute("data-reduce-motion");
				}
			}
		});
	}

	return {
		effectiveReduceMotion,
		reduceMotionEnabled,
		setReduceMotion,
		systemPreferenceActive,
		systemPrefersReducedMotion,
	};
}
