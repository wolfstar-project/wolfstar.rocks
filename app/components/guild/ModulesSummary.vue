<template>
	<section
		class="console-card flex flex-col"
		:aria-label="ts('guild_settings.modules.summary_aria')"
	>
		<div class="mb-2 flex items-center justify-between gap-3">
			<h3 class="text-base font-semibold">
				{{ ts("guild_settings.modules.title") }}
			</h3>
			<UBadge color="primary" variant="soft" size="md" class="font-semibold">
				{{
					ts("guild_settings.modules.enabled_count", {
						enabled: enabledCount,
						total: MODULE_SWITCH_KEYS.length,
					})
				}}
			</UBadge>
		</div>
		<ul>
			<li v-for="module in modules" :key="module.key">
				<button type="button" class="module-row" @click="goToSection(module.section)">
					<span
						class="size-2 shrink-0 rounded-full"
						:class="module.enabled ? 'bg-success' : 'bg-base-content/40'"
						aria-hidden="true"
					></span>
					<span class="flex-1 text-sm text-toned">{{ ts(module.labelKey) }}</span>
					<span class="text-xs text-muted">
						{{ module.state }}
					</span>
				</button>
			</li>
			<li v-for="module in announcedModules" :key="module.slug">
				<button type="button" class="module-row" @click="goToSection(module.slug)">
					<span
						class="size-2 shrink-0 rounded-full border border-base-content/40"
						aria-hidden="true"
					></span>
					<span class="flex-1 text-sm text-muted">{{ ts(module.labelKey) }}</span>
					<span class="text-xs text-muted">{{ ts("dashboard.coming_soon.badge") }}</span>
				</button>
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
import {
	countEnabledModules,
	GUILD_MODULES,
	MODULE_SWITCH_KEYS,
} from "#shared/utils/guild-modules";

const { tc, ts } = useI18n();
const { guildSettings } = useGuildSettings();
const { goToSection } = useDashboardNavigation();

const announcedModules = DASHBOARD_NAV.filter((item) => item.comingSoon);

const enabledCount = computed(() => countEnabledModules(guildSettings.value));

// The lists of channels are read for their counts; their sections share the cache.
const { activeGuildId } = useActiveGuild();
const lists = {
	autodelete: useAutoChannels("autodelete", activeGuildId),
	autopurge: useAutoChannels("autopurge", activeGuildId),
	automessage: useAutoChannels("automessage", activeGuildId),
};

// The `Modules` flags, then the modules that live in a table of their own:
// the honeypot is on once the bot has its channel, the appeals with their
// switch, and the lists of channels while they have one.
const modules = computed(() => {
	const settings = guildSettings.value;
	const honeypot = Boolean(settings?.honeypotChannel);
	const appeals = settings?.appealsEnabled === true;
	const onOff = (enabled: boolean) =>
		enabled ? ts("guild_settings.modules.on") : ts("guild_settings.modules.off");
	return [
		...GUILD_MODULES.map((module) => {
			const enabled = settings?.[module.key] === true;
			return {
				enabled,
				key: module.key,
				labelKey: module.labelKey,
				section: module.section,
				state: onOff(enabled),
			};
		}),
		{
			enabled: honeypot,
			key: "honeypot",
			labelKey: "dashboard.nav.honeypot",
			section: "honeypot",
			state: honeypot
				? ts("guild_settings.modules.set_up")
				: ts("guild_settings.modules.not_set_up"),
		},
		{
			enabled: appeals,
			key: "appeals",
			labelKey: "dashboard.nav.appeals",
			section: "appeals",
			state: onOff(appeals),
		},
		...(
			Object.entries(lists) as [keyof typeof lists, (typeof lists)[keyof typeof lists]][]
		).map(([slug, list]) => ({
			enabled: list.rows.value.length > 0,
			key: slug,
			labelKey: `dashboard.nav.${slug}`,
			section: slug,
			state: tc("guild_settings.modules.channel_count", list.rows.value.length),
		})),
	];
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.module-row {
	@apply flex min-h-9 w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent py-2 text-left;
	border-top: 1px solid var(--home-border-subtle);
}

.module-row:hover {
	background-color: var(--console-hover);
}

.module-row:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}
</style>
