<template>
	<nav class="dashboard-bottom-nav" :aria-label="ts('dashboard.nav_sections_aria')">
		<button
			v-for="tab of tabs"
			:key="tab.id"
			type="button"
			class="dashboard-bottom-tab"
			:class="{ 'dashboard-bottom-tab--current': tab.current }"
			:aria-current="tab.current ? 'page' : undefined"
			@click="tab.pick"
		>
			<UAvatar
				v-if="tab.id === 'you'"
				:src="user?.image ?? undefined"
				:alt="''"
				:text="user?.name?.slice(0, 2)"
				:ui="{ root: 'size-5.5' }"
			/>
			<UIcon v-else :name="tab.icon" class="size-5.5" aria-hidden="true" />
			<span class="max-w-full truncate">{{ tab.label }}</span>
		</button>
	</nav>
</template>

<script setup lang="ts">
import { findDashboardNavItem } from "~/utils/dashboard-nav";

const { ts } = useI18n();
const { goToSection, section } = useDashboardNavigation();
const { user } = useUserSession();
const { open: openPreferences } = usePreferencesDialog();

const TAB_SLUGS = ["", "modules", "automod", "logs"] as const;

const tabs = computed(() => [
	...TAB_SLUGS.flatMap((slug) => {
		const item = findDashboardNavItem(slug);
		return item
			? [
					{
						current: section.value === slug,
						icon: item.icon,
						id: slug || "overview",
						label: ts(item.shortLabelKey ?? item.labelKey),
						pick: () => goToSection(slug),
					},
				]
			: [];
	}),
	{
		current: false,
		icon: "ic:round-person",
		id: "you",
		label: ts("dashboard.nav_you"),
		pick: () => openPreferences(),
	},
]);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.dashboard-bottom-nav {
	@apply grid h-15 shrink-0 grid-cols-5 sm:hidden;
	background-color: var(--console-rail);
	border-top: 1px solid var(--home-border-subtle);
	padding-bottom: env(safe-area-inset-bottom);
	box-sizing: content-box;
}

.dashboard-bottom-tab {
	@apply flex cursor-pointer flex-col items-center justify-center gap-0.75 border-0 bg-transparent px-0.5 text-[0.625rem] font-semibold;
	color: var(--ui-text-muted);
}

.dashboard-bottom-tab--current {
	color: var(--color-primary);
}

.dashboard-bottom-tab:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}
</style>
