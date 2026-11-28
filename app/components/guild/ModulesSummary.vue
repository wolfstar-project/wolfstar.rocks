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
						total: modules.length,
					})
				}}
			</UBadge>
		</div>
		<ul>
			<li v-for="module in modules" :key="module.item.slug">
				<button type="button" class="module-row" @click="goToSection(module.item.slug)">
					<span
						class="size-2 shrink-0 rounded-full transition-colors duration-(--motion-base) ease-console"
						:class="module.enabled ? 'bg-success' : 'bg-base-content/40'"
						aria-hidden="true"
					></span>
					<span class="flex-1 text-sm text-toned">{{ ts(module.item.labelKey) }}</span>
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
const { ts } = useI18n();
const { guildSettings } = useGuildSettings();
const { goToSection } = useDashboardNavigation();
const { activeGuildId } = useActiveGuild();

const announcedModules = DASHBOARD_NAV.filter((item) => item.comingSoon);

// Staryl's module: its switch is read from Staryl, and it can be missing from the server.
const social = useSocialModule(activeGuildId);

function stateOf(enabled: boolean): string {
	return enabled ? ts("guild_settings.modules.on") : ts("guild_settings.modules.off");
}

// Every module, in sidebar order, with the sidebar's rule: a module is on when
// its switch is on and the setting it needs is set.
const modules = computed(() => {
	const settings = guildSettings.value;
	return DASHBOARD_NAV.filter((item) => isModuleGroup(item.group) && !item.comingSoon).map(
		(item) => {
			if (item.slug === "social") {
				const status = social.status.value;
				const enabled = status.kind === "ready" && status.state.enabled;
				const states = {
					"loading": "",
					"not-installed": ts("guild_settings.modules.not_set_up"),
					"ready": stateOf(enabled),
					"unavailable": ts("guild_settings.modules.unavailable"),
				} satisfies Record<typeof status.kind, string>;
				return { enabled, item, state: states[status.kind] };
			}
			const switchedOn = item.moduleKey !== undefined && settings?.[item.moduleKey] === true;
			const enabled =
				switchedOn &&
				(item.requiredKey === undefined || Boolean(settings?.[item.requiredKey]));
			return { enabled, item, state: stateOf(enabled) };
		},
	);
});

// Counted from the rows, so the badge agrees with the dots below it.
const enabledCount = computed(() => modules.value.filter((module) => module.enabled).length);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.module-row {
	@apply flex min-h-9 w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent py-2 text-left;
	border-top: 1px solid var(--home-border-subtle);
	transition: background-color var(--motion-fast) var(--ease-console);
}

.module-row:hover {
	background-color: var(--console-hover);
}

.module-row:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}
</style>
