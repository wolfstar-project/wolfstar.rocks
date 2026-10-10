<template>
	<section
		class="rounded-md border border-base-200 bg-base-200/30 p-3 sm:border-2 sm:p-4 md:p-6"
		:aria-label="ts('guild_settings.modules.summary_aria')"
	>
		<div class="flex items-center justify-between gap-3">
			<h2 class="text-xl font-semibold text-base-content">
				{{ ts("guild_settings.modules.title") }}
			</h2>
			<UBadge color="primary" variant="subtle">
				{{
					ts("guild_settings.modules.enabled_count", {
						enabled: enabledCount,
						total: GUILD_MODULES.length,
					})
				}}
			</UBadge>
		</div>
		<ul class="mt-2 divide-y divide-base-300/60">
			<li v-for="module in modules" :key="module.key">
				<button
					type="button"
					class="flex min-h-10 w-full cursor-pointer items-center gap-3 py-2 text-left text-sm transition-colors hover:text-base-content"
					@click="goToSection(module.section)"
				>
					<span
						class="size-2 shrink-0 rounded-full"
						:class="module.enabled ? 'bg-success' : 'bg-base-content/30'"
						aria-hidden="true"
					></span>
					<span class="flex-1 text-base-content/80">{{ ts(module.labelKey) }}</span>
					<span class="text-xs text-base-content/60">
						{{
							module.enabled
								? ts("guild_settings.modules.on")
								: ts("guild_settings.modules.off")
						}}
					</span>
				</button>
			</li>
		</ul>
		<div class="mt-3 flex justify-end">
			<UButton
				color="neutral"
				variant="ghost"
				size="sm"
				trailing-icon="heroicons:chevron-right-20-solid"
				@click="goToSection('modules')"
			>
				{{ ts("guild_settings.modules.manage") }}
			</UButton>
		</div>
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
