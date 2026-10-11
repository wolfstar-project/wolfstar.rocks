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
						total: GUILD_MODULES.length,
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
						{{
							module.enabled
								? ts("guild_settings.modules.on")
								: ts("guild_settings.modules.off")
						}}
					</span>
				</button>
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
import {
	countEnabledModules,
	GUILD_MODULES,
	guildModuleSection,
} from "#shared/utils/guild-modules";

const { ts } = useI18n();
const { guildSettings } = useGuildSettings();
const { goToSection } = useDashboardNavigation();

const enabledCount = computed(() => countEnabledModules(guildSettings.value));

const modules = computed(() =>
	GUILD_MODULES.map((module) => ({
		enabled: guildSettings.value?.[module.key] === true,
		key: module.key,
		labelKey: module.labelKey,
		section: guildModuleSection(module.slug),
	})),
);
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
