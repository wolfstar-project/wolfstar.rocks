<template>
	<div class="dashboard-sidebar">
		<header class="dashboard-sidebar-header">
			<template v-if="guildData">
				<UAvatar
					:src="guildIconSrc"
					:text="guildData.acronym"
					:alt="guildData.name"
					:ui="{ root: 'size-7 shrink-0' }"
				/>
				<span class="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold">
					{{ guildData.name }}
				</span>
			</template>
			<template v-else>
				<USkeleton class="size-7 shrink-0 rounded-full" />
				<USkeleton class="h-4 w-28 rounded" />
			</template>
		</header>

		<nav
			class="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2.5"
			:aria-label="ts('dashboard.nav_aria')"
		>
			<template v-for="group of groups" :key="group.id">
				<button
					v-if="group.id !== 'overview'"
					type="button"
					class="dashboard-nav-label dashboard-nav-label--toggle"
					:aria-expanded="isGroupOpen(group.id)"
					@click="toggleGroup(group.id)"
				>
					<UIcon
						name="ic:round-expand-more"
						class="size-4 shrink-0 transition-transform"
						:class="isGroupOpen(group.id) ? undefined : '-rotate-90'"
						aria-hidden="true"
					/>
					<span class="min-w-0 flex-1 text-left">{{ ts(group.labelKey) }}</span>
					<span
						v-if="!isGroupOpen(group.id) && group.hasCurrent"
						class="size-1.5 shrink-0 rounded-full bg-primary"
						:title="ts('dashboard.nav_current_group')"
					></span>
				</button>

				<template v-if="group.id === 'overview' || isGroupOpen(group.id)">
					<div
						v-if="group.recent.length > 0"
						class="flex flex-wrap items-center gap-1.5 pt-0.5 pr-1.5 pb-2 pl-2.5"
					>
						<UIcon
							name="ic:round-access-time"
							class="size-3.5 shrink-0 text-muted"
							:title="ts('dashboard.nav_recent')"
						/>
						<button
							v-for="item of group.recent"
							:key="item.slug"
							type="button"
							class="dashboard-nav-chip"
							@click="open(item.slug)"
						>
							<UIcon :name="item.icon" class="size-3 shrink-0" aria-hidden="true" />
							<span>{{ ts(item.labelKey) }}</span>
						</button>
					</div>

					<template v-for="(part, partIndex) of group.parts" :key="part.id">
						<div
							v-if="partIndex > 0"
							class="dashboard-nav-divider"
							aria-hidden="true"
						></div>
						<p v-if="part.titleKey" class="dashboard-nav-label">
							<UIcon
								name="ic:round-push-pin"
								class="size-3 shrink-0"
								aria-hidden="true"
							/>
							<span>{{ ts(part.titleKey) }}</span>
						</p>

						<div
							v-for="item of part.items"
							:key="item.slug"
							class="dashboard-nav-row"
							:class="{ 'dashboard-nav-row--current': item.current }"
						>
							<button
								type="button"
								class="dashboard-nav-button"
								:class="{ 'dashboard-nav-button--current': item.current }"
								:aria-current="item.current ? 'page' : undefined"
								@click="open(item.slug)"
							>
								<UIcon
									:name="item.icon"
									class="size-4.5 shrink-0"
									:class="item.current ? 'text-primary' : 'text-muted'"
									aria-hidden="true"
								/>
								<span class="min-w-0 flex-1 truncate">{{ ts(item.labelKey) }}</span>
								<span v-if="item.count !== null" class="dashboard-nav-count">
									{{ item.count }}
								</span>
								<span
									v-if="item.off"
									class="size-1.5 shrink-0 rounded-full bg-muted"
									:title="ts('dashboard.nav_module_off')"
								></span>
							</button>
							<button
								v-if="item.pinnable"
								type="button"
								class="dashboard-nav-pin"
								:class="{ 'dashboard-nav-pin--on': item.pinned }"
								:aria-pressed="item.pinned"
								:aria-label="
									ts(item.pinned ? 'dashboard.nav_unpin' : 'dashboard.nav_pin', {
										name: ts(item.labelKey),
									})
								"
								@click="togglePin(item.slug)"
							>
								<UIcon name="ic:round-push-pin" class="size-4" aria-hidden="true" />
							</button>
						</div>
					</template>
				</template>
			</template>
		</nav>

		<footer class="dashboard-sidebar-footer">
			<div class="dashboard-user min-w-0 flex-1">
				<UserMenu />
			</div>
			<UButton
				color="neutral"
				variant="ghost"
				size="md"
				icon="ic:round-settings"
				:aria-label="ts('dashboard.user_preferences')"
				:title="ts('dashboard.user_preferences')"
				to="/profile"
			/>
			<UButton
				color="neutral"
				variant="ghost"
				size="md"
				icon="ic:round-logout"
				:aria-label="ts('dashboard.user_sign_out')"
				:title="ts('dashboard.user_sign_out')"
				@click="signOut()"
			/>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { countEnabledModules } from "#shared/utils/guild-modules";
import {
	DASHBOARD_NAV,
	type DashboardNavGroup,
	type DashboardNavItem,
} from "~/utils/dashboard-nav";
import { resolveGuildIconSrc } from "~/utils/guild-dashboard";

const emit = defineEmits<{
	/** A section was opened, so a drawer holding the sidebar can close. */
	navigate: [];
}>();

const { ts } = useI18n();
const { guildData } = useGuildData();
const { guildSettings } = useGuildSettings();
const { goToSection, section } = useDashboardNavigation();
const { signOut } = useUserSession();
const { isGroupOpen, isPinned, recent, recordVisit, toggleGroup, togglePin } =
	useDashboardNavPrefs();

const guildIconSrc = computed(() => resolveGuildIconSrc(guildData.value, { size: 64 }));

const GROUP_LABEL_KEYS: Record<DashboardNavGroup, string> = {
	modules: "dashboard.nav_groups.modules",
	overview: "dashboard.nav_groups.management",
	records: "dashboard.nav_groups.records",
};

function open(slug: string) {
	goToSection(slug);
	emit("navigate");
}

// A visit counts once the section is actually shown: the unsaved-changes dialog
// can hold the navigation back.
watch(
	section,
	(slug) => {
		recordVisit(slug);
	},
	{ immediate: true },
);

function toRow(item: DashboardNavItem) {
	const enabled = item.moduleKey ? guildSettings.value?.[item.moduleKey] : undefined;
	return {
		...item,
		count:
			item.slug === "modules" && guildSettings.value
				? countEnabledModules(guildSettings.value)
				: null,
		current: section.value === item.slug,
		off: item.moduleKey !== undefined && enabled === false,
		pinnable: item.group === "modules",
		pinned: isPinned(item.slug),
	};
}

const groups = computed(() =>
	(["overview", "modules", "records"] as const).map((id) => {
		const items = DASHBOARD_NAV.filter((item) => item.group === id).map(toRow);
		const pinned = items.filter((item) => item.pinnable && item.pinned);
		const rest = items.filter((item) => !(item.pinnable && item.pinned));
		const parts = [
			...(pinned.length > 0
				? [{ id: "pinned", items: pinned, titleKey: "dashboard.nav_pinned" }]
				: []),
			{ id: "rest", items: rest, titleKey: undefined },
		].filter((part) => part.items.length > 0);

		return {
			hasCurrent: items.some((item) => item.current),
			id,
			labelKey: GROUP_LABEL_KEYS[id],
			parts,
			// Chips repeat sections the list already shows, so only unpinned,
			// non-current ones are offered.
			recent:
				id === "modules"
					? recent.value
							.map((slug) => items.find((item) => item.slug === slug))
							.filter((item): item is (typeof items)[number] => item !== undefined)
							.filter((item) => !item.current && !item.pinned)
							.slice(0, 3)
					: [],
		};
	}),
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.dashboard-sidebar {
	@apply flex h-full min-h-0 flex-col;
	background-color: var(--console-surface);
}

.dashboard-sidebar-header {
	@apply flex h-12 shrink-0 items-center gap-2.5 px-3;
	border-bottom: 1px solid var(--home-border-subtle);
	box-shadow: var(--console-shadow-low);
}

.dashboard-sidebar-footer {
	@apply flex shrink-0 items-center gap-1 p-2;
	border-top: 1px solid var(--home-border-subtle);
	background-color: var(--console-rail);
}

.dashboard-user :deep(button) {
	@apply min-h-11 gap-2.5 px-2 py-1 text-sm font-semibold;
	color: var(--ui-text-highlighted);
}

.dashboard-user :deep(button:hover) {
	background-color: var(--console-hover);
}

.dashboard-nav-label {
	@apply flex items-center gap-1.5 px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.06em] uppercase;
	color: var(--ui-text-muted);
}

.dashboard-nav-label--toggle {
	@apply mt-2 min-h-8 w-full cursor-pointer rounded-[5px] border-0 bg-transparent py-0 pr-2 pl-1.5;
}

.dashboard-nav-label--toggle:hover {
	background-color: var(--console-hover);
}

.dashboard-nav-divider {
	@apply mx-2.5 my-1.5 h-px;
	background-color: var(--home-border-subtle);
}

.dashboard-nav-chip {
	@apply inline-flex h-6.5 cursor-pointer items-center gap-1.25 rounded-full py-0 pr-2.25 pl-1.75 text-xs font-medium whitespace-nowrap;
	border: 1px solid var(--home-border-subtle);
	background-color: var(--console-input);
	color: var(--ui-text-toned);
}

.dashboard-nav-chip:hover {
	background-color: var(--console-active);
}

.dashboard-nav-row {
	@apply flex min-h-9 w-full items-center rounded-[5px];
}

.dashboard-nav-row:hover,
.dashboard-nav-row--current {
	background-color: var(--console-active);
}

.dashboard-nav-button {
	@apply flex min-h-9 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-[5px] border-0 bg-transparent px-2.5 text-left text-sm font-medium;
	color: var(--ui-text-toned);
}

.dashboard-nav-button--current {
	color: var(--ui-text-highlighted);
}

.dashboard-nav-count {
	@apply shrink-0 font-mono text-[0.6875rem];
	color: var(--ui-text-muted);
}

.dashboard-nav-pin {
	@apply mr-0.75 flex size-7.5 shrink-0 cursor-pointer items-center justify-center rounded-[5px] border-0 bg-transparent opacity-0;
	color: var(--ui-text-muted);
}

.dashboard-nav-pin--on {
	@apply opacity-100;
	color: var(--color-primary);
}

.dashboard-nav-row:hover .dashboard-nav-pin,
.dashboard-nav-row:focus-within .dashboard-nav-pin {
	@apply opacity-100;
}

/* Touch screens have no hover, so the pin stays reachable. */
@media (hover: none) {
	.dashboard-nav-pin {
		@apply opacity-75;
	}
}

.dashboard-nav-pin:focus-visible {
	@apply opacity-100;
}

.dashboard-nav-button:focus-visible,
.dashboard-nav-pin:focus-visible,
.dashboard-nav-chip:focus-visible,
.dashboard-nav-label--toggle:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}
</style>
