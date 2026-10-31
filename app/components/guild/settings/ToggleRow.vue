<template>
	<UFormField :name="name" class="border-t border-(--home-border-subtle) first:border-t-0">
		<div
			class="flex py-3"
			:class="switchFirst ? 'items-start gap-3' : 'items-center justify-between gap-4'"
		>
			<div class="min-w-0">
				<p class="text-sm font-bold">{{ title }}</p>
				<p class="mt-0.5 text-xs leading-relaxed text-muted">
					{{ description }}
				</p>
			</div>
			<USwitch
				v-model="enabled"
				class="shrink-0"
				:class="{ 'order-first mt-0.5': switchFirst }"
				:disabled="disabled"
				:aria-label="ts('guild_settings.toggle_aria', { title })"
			/>
		</div>
	</UFormField>
</template>

<script setup lang="ts">
const enabled = defineModel<boolean>({ required: true });

const {
	name,
	title,
	description,
	disabled = false,
	switchFirst = false,
} = defineProps<{
	/** The `GuildData` key the switch edits, used as the form field name. */
	name: string;
	title: string;
	description: string;
	/** Shows the value without letting it change, for a setting only the bot edits. */
	disabled?: boolean;
	/** The switch before the text, for a setting set beside a field rather than in a list. */
	switchFirst?: boolean;
}>();

const { ts } = useI18n();
</script>
