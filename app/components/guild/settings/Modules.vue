<template>
	<DashboardPageHeader
		:title="ts('guild_settings.modules.title')"
		:description="ts('guild_settings.modules.subtitle')"
	>
		<UBadge color="primary" variant="soft" size="lg" class="font-semibold">
			{{
				ts("guild_settings.modules.enabled_count", {
					enabled: enabledCount,
					total: GUILD_MODULES.length,
				})
			}}
		</UBadge>
		<UButton color="neutral" variant="outline" size="sm" @click="setAll(true)">
			{{ ts("guild_settings.modules.enable_all") }}
		</UButton>
		<UButton color="neutral" variant="outline" size="sm" @click="setAll(false)">
			{{ ts("guild_settings.modules.disable_all") }}
		</UButton>
	</DashboardPageHeader>

	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.modules.form_aria')"
		@error="onError"
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			<UFormField
				v-for="module in GUILD_MODULES"
				:key="module.key"
				:name="module.key"
				class="console-card flex flex-col transition-opacity"
				:ui="{ container: 'flex h-full flex-1 flex-col' }"
			>
				<div class="flex items-start justify-between gap-3">
					<span
						class="flex size-11 shrink-0 items-center justify-center rounded-lg"
						:class="
							state[module.key]
								? 'bg-primary/15 text-primary'
								: 'bg-base-content/8 text-muted'
						"
						aria-hidden="true"
					>
						<UIcon :name="module.icon" class="size-5.5" />
					</span>
					<USwitch
						v-model="state[module.key]"
						class="shrink-0"
						:aria-label="
							ts('guild_settings.modules.toggle_aria', {
								title: ts(module.labelKey),
							})
						"
					/>
				</div>
				<div class="mt-3 min-w-0 flex-1" :class="{ 'opacity-60': !state[module.key] }">
					<p class="text-base font-bold">{{ ts(module.labelKey) }}</p>
					<p class="mt-1 text-[0.8125rem] leading-snug text-muted">
						{{ ts(module.descriptionKey) }}
					</p>
				</div>
				<div class="mt-4 flex justify-end">
					<UButton
						color="neutral"
						variant="ghost"
						size="sm"
						:disabled="!state[module.key]"
						@click="goToSection(module.section)"
					>
						{{
							state[module.key]
								? ts("guild_settings.modules.configure")
								: ts("guild_settings.modules.enable_first")
						}}
					</UButton>
				</div>
			</UFormField>

			<section
				v-for="module in announcedModules"
				:key="module.slug"
				class="console-card flex flex-col"
				:aria-label="ts(module.labelKey)"
			>
				<div class="flex items-start justify-between gap-3">
					<span
						class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-base-content/8 text-muted"
						aria-hidden="true"
					>
						<UIcon :name="module.icon" class="size-5.5" />
					</span>
					<UBadge color="neutral" variant="subtle" class="font-semibold">
						{{ ts("dashboard.coming_soon.badge") }}
					</UBadge>
				</div>
				<div class="mt-3 min-w-0 flex-1 opacity-60">
					<p class="text-base font-bold">{{ ts(module.labelKey) }}</p>
					<p
						v-if="module.descriptionKey"
						class="mt-1 text-[0.8125rem] leading-snug text-muted"
					>
						{{ ts(module.descriptionKey) }}
					</p>
				</div>
				<div class="mt-4 flex justify-end">
					<UButton
						color="neutral"
						variant="ghost"
						size="sm"
						@click="goToSection(module.slug)"
					>
						{{ ts("dashboard.coming_soon.learn_more") }}
					</UButton>
				</div>
			</section>
		</div>
	</GuildSettingsForm>
</template>

<script setup lang="ts">
import { GUILD_MODULES } from "#shared/utils/guild-modules";

const { ts } = useI18n();
const { goToSection } = useDashboardNavigation();

const moduleKeys = GUILD_MODULES.map((module) => module.key);

const { mapToGuildData, onError, schema, state } = useSettingsForm({ toggles: moduleKeys });

// Modules the bot has and the dashboard cannot configure yet.
const announcedModules = DASHBOARD_NAV.filter((item) => item.comingSoon);

const enabledCount = computed(() => countEnabledModules(state));

function setAll(enabled: boolean) {
	for (const key of moduleKeys) {
		state[key] = enabled;
	}
}
</script>
