<template>
	<UFormField :name="name" class="border-t border-base-300/60">
		<div class="flex items-center justify-between gap-4 py-3">
			<div class="min-w-0">
				<p class="text-sm font-semibold text-base-content">{{ title }}</p>
				<p class="mt-0.5 text-xs leading-relaxed text-base-content/70">
					{{ description }}
				</p>
			</div>
			<USwitch
				v-model="enabled"
				class="shrink-0"
				:aria-label="ts('guild_settings.toggle_aria', { title })"
			/>
		</div>
	</UFormField>
</template>

<script setup lang="ts">
const enabled = defineModel<boolean>({ required: true });

const { name, title, description } = defineProps<{
	/** The `GuildData` key the switch edits, used as the form field name. */
	name: string;
	title: string;
	description: string;
}>();

const { ts } = useI18n();
</script>
