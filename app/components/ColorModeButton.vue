<template>
	<ClientOnly>
		<UDropdownMenu
			:items="themeItems"
			:content="{ align: 'end', sideOffset: 8 }"
			:ui="{ content: 'min-w-48' }"
		>
			<UButton
				:aria-label="ts('profile.theme_menu_aria')"
				:icon="currentOption.icon"
				:label="showLabel ? currentOption.label : undefined"
				:trailing-icon="showLabel ? 'lucide:chevron-down' : undefined"
				color="neutral"
				:variant
				:size
				:class="showLabel ? undefined : 'rounded-full'"
				aria-haspopup="menu"
			/>
		</UDropdownMenu>
		<template #fallback>
			<USkeleton :class="showLabel ? 'h-8 w-40' : 'size-8 rounded-full'" />
		</template>
	</ClientOnly>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { ColorModePreference } from "~/composables/useSettings";
import { COLOR_MODE_PREFERENCES } from "~/composables/useSettings";

const {
	showLabel = true,
	size = "sm",
	variant = "outline",
} = defineProps<{
	/** Show the current theme label next to the icon (settings surfaces). */
	showLabel?: boolean;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link";
}>();

interface DocumentWithActiveVT extends Document {
	readonly activeViewTransition: ViewTransition | null;
}

const { ts } = useI18n();
const { preference, setColorMode } = useAppColorMode();
const { effectiveReduceMotion } = useReduceMotion();

const themeMeta = computed(() => ({
	system: {
		icon: "lucide:monitor",
		label: ts("common.system"),
	},
	light: {
		icon: "lucide:sun",
		label: ts("common.light"),
	},
	dark: {
		icon: "lucide:moon",
		label: ts("common.dark"),
	},
	midnight: {
		icon: "lucide:sparkles",
		label: ts("common.midnight_experimental"),
	},
}));

const currentOption = computed(() => {
	const selected = preference.value;
	return themeMeta.value[selected] ?? themeMeta.value.system;
});

const themeItems = computed<DropdownMenuItem[]>(() =>
	COLOR_MODE_PREFERENCES.map((value) => {
		const meta = themeMeta.value[value];
		return {
			checked: preference.value === value,
			icon: meta.icon,
			label: meta.label,
			onSelect(e: Event) {
				e.preventDefault();
				selectTheme(value);
			},
			onUpdateChecked(checked: boolean) {
				if (checked) {
					selectTheme(value);
				}
			},
			type: "checkbox" as const,
		};
	}),
);

function selectTheme(value: ColorModePreference) {
	if (preference.value === value) return;
	startViewTransition(() => {
		setColorMode(value);
	});
}

function startViewTransition(apply: () => void) {
	if (!import.meta.client || !document.startViewTransition || effectiveReduceMotion.value) {
		apply();
		return;
	}

	if ((document as DocumentWithActiveVT).activeViewTransition) {
		apply();
		return;
	}

	document.startViewTransition(apply);
}
</script>

<style>
::view-transition-old(root),
::view-transition-new(root) {
	mix-blend-mode: normal;
	animation: none;
}

::view-transition-new(root) {
	z-index: 9999;
}
::view-transition-old(root) {
	z-index: 1;
}
</style>
