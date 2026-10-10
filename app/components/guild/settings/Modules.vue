<template>
	<GuildSettingsSection
		:title="ts('guild_settings.modules.title')"
		:description="ts('guild_settings.modules.subtitle')"
	>
		<GuildSettingsForm
			:schema="schema"
			:state="state"
			:map-to-guild-data="mapToGuildData"
			:aria-label="ts('guild_settings.modules.form_aria')"
			class="space-y-4"
			@error="onError"
		>
			<div class="flex flex-wrap items-center gap-3">
				<UBadge color="primary" variant="subtle">
					{{
						ts("guild_settings.modules.enabled_count", {
							enabled: enabledCount,
							total: GUILD_MODULES.length,
						})
					}}
				</UBadge>
				<p class="text-sm text-base-content/60">
					{{ ts("guild_settings.modules.hint") }}
				</p>
				<UFieldGroup size="sm" class="ml-auto">
					<UButton color="success" variant="solid" @click="setAll(true)">
						{{ ts("guild_settings.modules.enable_all") }}
					</UButton>
					<UButton color="warning" variant="solid" @click="setAll(false)">
						{{ ts("guild_settings.modules.disable_all") }}
					</UButton>
				</UFieldGroup>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
				<UFormField
					v-for="module in GUILD_MODULES"
					:key="module.key"
					:name="module.key"
					class="flex h-full flex-col rounded-xl border bg-base-100 p-4 shadow-sm transition-colors"
					:class="state[module.key] ? 'border-primary/30' : 'border-base-300/60'"
				>
					<div class="flex items-start gap-3">
						<span
							class="flex size-10 shrink-0 items-center justify-center rounded-lg"
							:class="
								state[module.key]
									? 'bg-primary/15 text-primary'
									: 'bg-base-200 text-base-content/60'
							"
							aria-hidden="true"
						>
							<UIcon :name="module.icon" class="size-5" />
						</span>
						<div class="min-w-0 flex-1">
							<p class="font-semibold text-base-content">{{ ts(module.labelKey) }}</p>
							<p class="mt-1 text-sm leading-snug text-base-content/60">
								{{ ts(module.descriptionKey) }}
							</p>
						</div>
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
					<div
						class="mt-4 flex items-center justify-between gap-3 border-t border-base-300/60 pt-3"
					>
						<span class="text-xs text-base-content/60">
							{{
								state[module.key]
									? ts("guild_settings.modules.active_hint")
									: ts("guild_settings.modules.inactive_hint")
							}}
						</span>
						<UButton
							color="neutral"
							variant="ghost"
							size="sm"
							trailing-icon="heroicons:chevron-right-20-solid"
							@click="goToSection(module.section)"
						>
							{{ ts("guild_settings.modules.configure") }}
						</UButton>
					</div>
				</UFormField>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>
</template>

<script setup lang="ts">
import { GUILD_MODULES } from "#shared/utils/guild-modules";

const { ts } = useI18n();
const { goToSection } = useDashboardNavigation();

const moduleKeys = GUILD_MODULES.map((module) => module.key);

const { mapToGuildData, onError, schema, state } = useSettingsForm({ toggles: moduleKeys });

const enabledCount = computed(() => countEnabledModules(state));

function setAll(enabled: boolean) {
	for (const key of moduleKeys) {
		state[key] = enabled;
	}
}
</script>
