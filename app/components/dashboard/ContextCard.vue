<template>
	<div class="context-card" role="region" :aria-label="ts('dashboard.phone.context_aria')">
		<span class="context-card-tile" aria-hidden="true">
			<UIcon :name="item?.icon ?? 'ic:round-dashboard'" class="size-5" />
		</span>
		<div class="min-w-0 flex-1">
			<p class="truncate text-[0.9375rem] leading-tight font-bold">
				{{ guildData?.name }}
			</p>
			<p class="truncate text-xs leading-tight text-muted">{{ summary }}</p>
		</div>
		<USwitch
			v-if="moduleKey"
			:model-value="moduleOn"
			:aria-label="ts('guild_settings.modules.toggle_aria', { title: label })"
			@update:model-value="setModule"
		/>
		<UButton
			v-else
			data-testid="context-card-list"
			color="neutral"
			variant="soft"
			icon="ic:round-format-list-bulleted"
			:aria-label="ts('dashboard.phone.back')"
			@click="openList"
		/>
	</div>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import { countEnabledModules, MODULE_SWITCH_KEYS } from "#shared/utils/guild-modules";
import { setGuildDataChange } from "#shared/utils/guild-settings-map";
import { findDashboardNavItem } from "~/utils/dashboard-nav";

const { ts } = useI18n();
const { section } = useDashboardNavigation();
const { guildData } = useGuildData();
const { guildSettings, originalGuildSettings } = useGuildSettings();
const { removeChange, setGuildSettingsChanges } = useGuildSettingsChanges();
const { openList } = usePhoneScreen();

const item = computed(() => findDashboardNavItem(section.value));
const label = computed(() => ts(item.value?.labelKey ?? "dashboard.nav.overview"));

// The switch of the section's feature, the one its banner shows, when it has one.
const moduleKey = computed(() => item.value?.moduleKey ?? null);
const moduleOn = computed(() =>
	moduleKey.value ? guildSettings.value?.[moduleKey.value] === true : false,
);

const summary = computed(() => {
	if (moduleKey.value) {
		return moduleOn.value
			? ts("dashboard.phone.module_on", { name: label.value })
			: ts("dashboard.phone.module_off", { name: label.value });
	}
	if (section.value === "" || section.value === "modules") {
		return ts("dashboard.phone.modules_on", {
			count: countEnabledModules(guildSettings.value),
			total: MODULE_SWITCH_KEYS.length,
		});
	}
	return label.value;
});

// Staged like the banner's switch: flipping it back to what is saved leaves nothing staged.
function setModule(on: boolean) {
	const key = moduleKey.value;
	if (!key) return;
	if (originalGuildSettings.value?.[key] === on) {
		removeChange(key);
		return;
	}
	const changes: Partial<GuildData> = {};
	setGuildDataChange(changes, key, on);
	setGuildSettingsChanges(changes);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* Floats over the foot of the page, as the account card does over the list. */
.context-card {
	@apply absolute inset-x-2.5 bottom-2.5 z-10 flex items-center gap-3 rounded-2xl py-2.5 pr-3 pl-2.5;
	background-color: var(--console-solid);
	border: 1px solid var(--console-border);
	box-shadow:
		0 8px 24px oklch(0% 0 0 / 0.28),
		0 2px 6px oklch(0% 0 0 / 0.2);
	padding-bottom: calc(0.625rem + env(safe-area-inset-bottom));
}

.context-card-tile {
	@apply flex size-10 shrink-0 items-center justify-center rounded-xl text-primary;
	background-color: oklch(from var(--color-primary) l c h / 0.15);
}
</style>
