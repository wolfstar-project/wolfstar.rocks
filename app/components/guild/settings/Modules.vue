<template>
	<GuildSettingsSection
		:title="ts('guild_settings.modules.title')"
		:description="ts('guild_settings.modules.subtitle')"
	>
		<GuildSettingsForm
			:schema="ModulesSettingsSchema"
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
							@click="goToSection(guildModuleSection(module.slug))"
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
import type { GuildData } from "#server/database";
import type { FormErrorEvent } from "@nuxt/ui";
import { ModulesSettingsSchema, type ModulesSettingsSchemaType } from "#shared/schemas";
import {
	countEnabledModules,
	GUILD_MODULES,
	guildModuleSection,
} from "#shared/utils/guild-modules";
import { setGuildDataChange } from "#shared/utils/guild-settings-map";

const { ts } = useI18n();
const { guildSettings } = useGuildSettings();
const { goToSection } = useDashboardNavigation();
const toast = useToast();

const createDefaultState = (): ModulesSettingsSchemaType => {
	const defaults: Partial<ModulesSettingsSchemaType> = {};
	for (const module of GUILD_MODULES) {
		defaults[module.key] = guildSettings.value?.[module.key] ?? false;
	}
	return defaults as ModulesSettingsSchemaType;
};

const state = reactive<ModulesSettingsSchemaType>(createDefaultState());

const enabledCount = computed(() => countEnabledModules(state));

function setAll(enabled: boolean) {
	for (const module of GUILD_MODULES) {
		state[module.key] = enabled;
	}
}

function mapToGuildData(stateData: ModulesSettingsSchemaType): Partial<GuildData> {
	const result: Partial<GuildData> = {};
	for (const module of GUILD_MODULES) {
		setGuildDataChange(result, module.key, stateData[module.key]);
	}
	return result;
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: errorMessage ?? ts("guild_settings.please_try_again"),
		icon: "heroicons:x-circle",
		title: ts("guild_settings.save_failed"),
	});
}

watch(
	guildSettings,
	(newSettings) => {
		if (newSettings) {
			for (const module of GUILD_MODULES) {
				state[module.key] = newSettings[module.key] ?? false;
			}
		}
	},
	{ deep: true },
);
</script>
