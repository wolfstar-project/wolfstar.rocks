<template>
	<h2 class="setup-title" tabindex="-1">
		{{ ts("guild_settings.setup.modules.title", { name: guildData?.name ?? "" }) }}
	</h2>
	<p class="setup-lead">{{ ts("guild_settings.setup.modules.description") }}</p>

	<ul class="mt-4.5 flex flex-col gap-2.5">
		<li
			v-for="module of modules"
			:key="module.key"
			class="setup-module"
			:class="{ 'setup-module--on': module.on }"
		>
			<span class="setup-module-tile" aria-hidden="true">
				<UIcon :name="module.icon" class="size-5" />
			</span>
			<div class="min-w-0 grow">
				<p class="flex flex-wrap items-center gap-2">
					<span class="text-[0.9375rem] font-bold">{{ module.label }}</span>
					<span v-if="module.recommended" class="setup-pill">
						{{ ts("guild_settings.setup.modules.recommended") }}
					</span>
				</p>
				<p class="mt-0.5 text-[0.8125rem] leading-snug text-muted">
					{{ module.description }}
				</p>
			</div>
			<USwitch
				:model-value="module.on"
				:aria-label="ts('guild_settings.setup.modules.turn_on', { name: module.label })"
				@update:model-value="toggle(module.key, $event)"
			/>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { GUILD_MODULES } from "#shared/utils/guild-modules";
import { SETUP_RECOMMENDED_MODULES, type SetupDraft } from "~/utils/guild-setup";

const draft = defineModel<SetupDraft>("draft", { required: true });

const { ts } = useI18n();
const { guildData } = useGuildData();

const modules = computed(() =>
	GUILD_MODULES.map((module) => ({
		description: ts(module.descriptionKey),
		icon: module.icon,
		key: module.key,
		label: ts(module.labelKey),
		on: draft.value.modules[module.key],
		recommended: SETUP_RECOMMENDED_MODULES.includes(module.key),
	})),
);

function toggle(key: (typeof GUILD_MODULES)[number]["key"], on: boolean) {
	draft.value = { ...draft.value, modules: { ...draft.value.modules, [key]: on } };
}
</script>
